import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

type DynamicJsonViewProps = {
  data: any;
  title?: string;
};



const isObject = (value: any): boolean =>
  value !== null && typeof value === 'object';

const isImageUrl = (value: any): boolean =>
  typeof value === 'string' &&
  (/^https?:\/\//i.test(value) || /^data:image\//i.test(value));

const formatKey = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value);
};

const getColumns = (rows: any[]): string[] => {
  const keys: string[] = [];

  rows.forEach(row => {
    if (isObject(row) && !Array.isArray(row)) {
      Object.keys(row).forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
    }
  });

  return keys;
};

/**
 * Detects extracted fields such as:
 * {
 *   gstin: {
 *     value: "...",
 *     citations: [...]
 *   }
 * }
 */
 
/**
 * Keeps only the required properties from each citation.
 * All other citation and parentBlock properties are removed.
 */
const cleanCitation = (citation: any) => {
  if (!isObject(citation) || Array.isArray(citation)) {
    return {};
  }

  const cleaned: Record<string, any> = {};

  if (Object.prototype.hasOwnProperty.call(citation, 'content')) {
    cleaned.content = citation.content;
  }

  if (
    isObject(citation.parentBlock) &&
    !Array.isArray(citation.parentBlock) &&
    Object.prototype.hasOwnProperty.call(
      citation.parentBlock,
      'content',
    )
  ) {
    cleaned.parentBlock = {
      content: citation.parentBlock.content,
    };
  }

  return cleaned;
};

/**
 * Cleans extracted fields dynamically.
 * Original data is not modified.
 */
const cleanExtractedData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => cleanExtractedData(item));
  }

  if (!isObject(data)) {
    return data;
  }

  const result: Record<string, any> = {};

  Object.entries(data).forEach(([key, item]) => {
    if (isExtractedField(item)) {
      result[key] = {
        value: item.value,
        citations: Array.isArray(item.citations)
          ? item.citations.map(cleanCitation)
          : [],
      };
    } else {
      result[key] = cleanExtractedData(item);
    }
  });

  return result;
};

const ValueView = ({value}: {value: any}) => {
  if (value === null || value === undefined || value === '') {
    return <Text style={styles.value}>—</Text>;
  }

  if (isImageUrl(value)) {
    return (
      <Image
        source={{uri: value}}
        style={styles.image}
        resizeMode="contain"
      />
    );
  }

  if (Array.isArray(value)) {
    return <DynamicArray data={value} />;
  }

  if (isObject(value)) {
    return <DynamicObject data={value} />;
  }

  return (
    <Text selectable style={styles.value}>
      {formatValue(value)}
    </Text>
  );
};

const HIDDEN_KEYS = new Set([
  'response_type',
  'job_id',
  'usage',
  'duration',
  'studio_link',
  'citations',
  'parentblock',
  'bbox',
  'confidence',
  'granular_confidence',
  'image_url',
  'chart_data',
  'extra',
  'type',
  'num_pages',
  'num_fields',
  'credits',
  'extract_mode',
  'usage_breakdown',
  'extract_model',
  'tier',
  'extract_pages',
  'extract_fields',
  'ocr_pages',
  'charts',
  'prompted_blocks',
]);

const shouldHideKey = (key: string): boolean =>
  HIDDEN_KEYS.has(key.toLowerCase());

const isExtractedField = (value: any): boolean =>
  isObject(value) &&
  !Array.isArray(value) &&
  Object.prototype.hasOwnProperty.call(value, 'value') &&
  Object.prototype.hasOwnProperty.call(value, 'citations');

const DynamicObject = ({
  data,
}: {
  data: Record<string, any>;
}) => {
  const entries = Object.entries(data).filter(
    ([key]) => !shouldHideKey(key),
  );

  if (!entries.length) {
    return null;
  }

  return (
    <View style={styles.objectContainer}>
      {entries.map(([key, item]) => {
        // Extracted fields: show only Key : value.
        if (isExtractedField(item)) {
          return (
            <View key={key} style={styles.fieldRow}>
              <Text style={styles.label}>{formatKey(key)}</Text>
              <Text style={styles.colon}>:</Text>
              <View style={styles.fieldValue}>
                <ValueView value={item.value} />
              </View>
            </View>
          );
        }

        // Nested objects: filter their keys recursively.
        if (isObject(item) && !Array.isArray(item)) {
          const visibleEntries = Object.keys(item).filter(
            nestedKey => !shouldHideKey(nestedKey),
          );

          if (!visibleEntries.length) {
            return null;
          }

          return (
            <View key={key} style={styles.fieldContainer}>
              <Text style={styles.sectionTitle}>
                {formatKey(key)}
              </Text>
              <DynamicObject data={item} />
            </View>
          );
        }

        // Arrays: render dynamically.
        if (Array.isArray(item)) {
          return (
            <View key={key} style={styles.fieldContainer}>
              <Text style={styles.sectionTitle}>
                {formatKey(key)}
              </Text>
              <DynamicArray data={item} />
            </View>
          );
        }

        // Normal primitive fields.
        return (
              <ValueView value={item} />
        );
      })}
    </View>
  );
};



const DynamicArray = ({data}: {data: any[]}) => {
  if (!data.length) {
    return <Text style={styles.muted}>No records available</Text>;
  }

  const objectRows = data.filter(
    item => isObject(item) && !Array.isArray(item),
  );

  const allObjects = objectRows.length === data.length;
  const columns = allObjects ? getColumns(data) : [];

  if (!allObjects || !columns.length) {
    return (
      <View style={styles.arrayContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.arrayItem}>
            <Text style={styles.itemNumber}>{index + 1}.</Text>
            <View style={styles.arrayItemContent}>
              <ValueView value={item} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {columns.map(column => (
            <View key={column} style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>
                {formatKey(column)}
              </Text>
            </View>
          ))}
        </View>

        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 && styles.alternateRow,
            ]}>
            {columns.map(column => (
              <View key={column} style={styles.tableCell}>
                <ValueView value={item[column]} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const DynamicJsonView = ({
  data,
  title = 'Details',
}: DynamicJsonViewProps) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const {width} = useWindowDimensions();

  if (data === null || data === undefined) {
    return (
      <View style={styles.empty}>
        <Text style={styles.muted}>No data available.</Text>
      </View>
    );
  }

  // Clean the data for display without modifying the original object.
  const cleanedData = cleanExtractedData(data);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      nestedScrollEnabled>
      <View
        style={[
          styles.paper,
          {minWidth: Math.min(width - 16, 300)},
        ]}>
        <Text style={styles.documentTitle}>{title}</Text>

        {Array.isArray(cleanedData) ? (
          <DynamicArray data={cleanedData} />
        ) : isObject(cleanedData) ? (
          <DynamicObject data={cleanedData} />
        ) : (
          <View style={styles.rootValue}>
            <ValueView value={cleanedData} />
          </View>
        )}
      </View>

    </ScrollView>
  );
};

export default DynamicJsonView;

const BORDER = '#222222';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  screenContent: {
    paddingBottom: 24,
  },
  paper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 0,
    overflow: 'hidden',
  },
  documentTitle: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '800',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  objectContainer: {
    paddingHorizontal: 2,
    paddingVertical: 5,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  label: {
    flex: 1,
    color: '#222222',
    fontSize: 11,
    fontWeight: '600',
  },
  colon: {
    width: 12,
    textAlign: 'center',
    color: '#222222',
    fontSize: 11,
  },
  fieldValue: {
    flex: 1.3,
    minWidth: 0,
  },
  value: {
    color: '#111111',
    fontSize: 11,
    lineHeight: 16,
  },
  nestedSection: {
    marginTop: 7,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: '#F1F1F1',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  citationContainer: {
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#D1D5DB',
  },
  arrayContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  itemNumber: {
    width: 25,
    color: '#222222',
    fontSize: 11,
  },
  arrayItemContent: {
    flex: 1,
    minWidth: 0,
  },
  table: {
    minWidth: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  alternateRow: {
    backgroundColor: '#F7F7F7',
  },
  tableHeaderCell: {
    width: 145,
    paddingHorizontal: 7,
    paddingVertical: 9,
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  tableHeaderText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: '800',
  },
  tableCell: {
    width: 145,
    minHeight: 35,
    paddingHorizontal: 7,
    paddingVertical: 7,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  image: {
    width: 120,
    height: 90,
    alignSelf: 'flex-start',
  },
  rootValue: {
    padding: 10,
  },
  muted: {
    color: '#555555',
    fontSize: 11,
    padding: 10,
  },
  empty: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rawButton: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rawButtonText: {
    color: '#202020',
    fontSize: 12,
    fontWeight: '700',
  },
  rawContainer: {
    maxHeight: 350,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#172033',
  },
  rawText: {
    color: '#E8EEF9',
    fontSize: 11,
    lineHeight: 17,
    fontFamily: 'monospace',
  },
});