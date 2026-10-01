import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type InvoiceItem = {
  id: string;
  description: string;
  productCode: string;
  quantity: string;
  unit: string;
  rate: string;
  taxRate: string;
  taxAmount: string;
  amount: string;
};

type TaxItem = {
  id: string;
  rate: string;
  base: string;
  amount: string;
};

type Party = {
  name: string;
  phone: string;
  email: string;
  gstin: string;
  tin: string;
  customerId: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Address = {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Payment = {
  accountNumber: string;
  iban: string;
  swift: string;
  routingNumber: string;
};

type InvoiceFormData = {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  documentType: string;
  currency: string;

  supplier: Party;
  customer: Party;

  billing: Address;
  shipping: Address;

  payment: Payment;

  items: InvoiceItem[];
  taxes: TaxItem[];

  subtotal: string;
  taxAmount: string;
  grandTotal: string;
};

interface InvoiceFormProps {
  mindeeData: any;
  onSave?: (data: InvoiceFormData) => void;
}

const valueOf = (
  field: any,
  fallback: string = ""
): string => {
  if (
    field === null ||
    field === undefined ||
    field.value === null ||
    field.value === undefined
  ) {
    return fallback;
  }

  return String(field.value);
};

const nestedValue = (
  field: any,
  key: string,
  fallback: string = ""
): string => {
  return valueOf(
    field?.fields?.[key],
    fallback
  );
};

const numberToString = (
  value: any
): string => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value);
};

const emptyParty = (): Party => ({
  name: "",
  phone: "",
  email: "",
  gstin: "",
  tin: "",
  customerId: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
});

const emptyAddress = (): Address => ({
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
});

const emptyPayment = (): Payment => ({
  accountNumber: "",
  iban: "",
  swift: "",
  routingNumber: "",
});

const convertMindeeToForm = (
  response: any
): InvoiceFormData => {
  const fields =
    response?.inference?.result?.fields || {};

  // ---------------------------------------
  // SUPPLIER REGISTRATION
  // ---------------------------------------

  const registrations =
    fields?.supplier_company_registration
      ?.items || [];

  const gstin =
    registrations.find(
      (item: any) =>
        String(
          item?.fields?.type?.value || ""
        ).toUpperCase() === "GSTIN"
    )?.fields?.number?.value || "";

  const tin =
    registrations.find(
      (item: any) =>
        String(
          item?.fields?.type?.value || ""
        ).toUpperCase() === "TIN"
    )?.fields?.number?.value || "";

  // ---------------------------------------
  // SUPPLIER ADDRESS
  // ---------------------------------------

  const supplierAddress =
    fields?.supplier_address;

  // ---------------------------------------
  // CUSTOMER ADDRESS
  // ---------------------------------------

  const customerAddress =
    fields?.customer_address;

  // ---------------------------------------
  // BILLING ADDRESS
  // ---------------------------------------

  const billingAddress =
    fields?.billing_address;

  // ---------------------------------------
  // SHIPPING ADDRESS
  // ---------------------------------------

  const shippingAddress =
    fields?.shipping_address;

  // ---------------------------------------
  // PAYMENT
  // ---------------------------------------

  const payment =
    fields
      ?.supplier_payment_details
      ?.items?.[0]
      ?.fields || {};

  // ---------------------------------------
  // ITEMS
  // ---------------------------------------

  const mindeeItems =
    fields?.line_items?.items || [];

  const items: InvoiceItem[] =
    mindeeItems.map(
      (item: any, index: number) => {
        const f =
          item?.fields || {};

        return {
          id: `item-${Date.now()}-${index}`,

          description: valueOf(
            f?.description
          ),

          productCode: valueOf(
            f?.product_code
          ),

          quantity: numberToString(
            f?.quantity?.value
          ),

          unit: valueOf(
            f?.unit_measure
          ),

          rate: numberToString(
            f?.unit_price?.value
          ),

          taxRate:
            f?.tax_rate?.value !==
            null &&
            f?.tax_rate?.value !==
            undefined
              ? String(
                  Number(
                    f.tax_rate.value
                  ) * 100
                )
              : "",

          taxAmount:
            f?.tax_amount?.value !==
              null &&
            f?.tax_amount?.value !==
              undefined
              ? String(
                  f.tax_amount.value
                )
              : "",

          amount: numberToString(
            f?.total_price?.value
          ),
        };
      }
    );

  // ---------------------------------------
  // TAXES
  // ---------------------------------------

  const mindeeTaxes =
    fields?.taxes?.items || [];

  const taxes: TaxItem[] =
    mindeeTaxes.map(
      (tax: any, index: number) => {
        const f =
          tax?.fields || {};

        return {
          id: `tax-${Date.now()}-${index}`,

          rate:
            f?.rate?.value !==
              null &&
            f?.rate?.value !==
              undefined
              ? String(
                  Number(
                    f.rate.value
                  ) * 100
                )
              : "",

          base: numberToString(
            f?.base?.value
          ),

          amount: numberToString(
            f?.amount?.value
          ),
        };
      }
    );

  return {
    invoiceNo: valueOf(
      fields?.invoice_number
    ),

    invoiceDate: valueOf(
      fields?.date
    ),

    dueDate: valueOf(
      fields?.due_date
    ),

    poNumber: valueOf(
      fields?.po_number
    ),

    documentType: valueOf(
      fields?.document_type
    ),

    currency: nestedValue(
      fields?.locale,
      "currency",
      "INR"
    ),

    // -----------------------------------
    // SUPPLIER
    // -----------------------------------

    supplier: {
      name: valueOf(
        fields?.supplier_name
      ),

      phone: valueOf(
        fields?.supplier_phone_number
      ),

      email: valueOf(
        fields?.supplier_email
      ),

      gstin,

      tin,

      customerId: "",

      address: nestedValue(
        supplierAddress,
        "address"
      ),

      city: nestedValue(
        supplierAddress,
        "city"
      ),

      state: nestedValue(
        supplierAddress,
        "state"
      ),

      postalCode: nestedValue(
        supplierAddress,
        "postal_code"
      ),

      country: nestedValue(
        supplierAddress,
        "country"
      ),
    },

    // -----------------------------------
    // CUSTOMER
    // -----------------------------------

    customer: {
      name: valueOf(
        fields?.customer_name
      ),

      phone: "",

      email: "",

      gstin: "",

      tin: "",

      customerId: valueOf(
        fields?.customer_id
      ),

      address: nestedValue(
        customerAddress,
        "address"
      ),

      city: nestedValue(
        customerAddress,
        "city"
      ),

      state: nestedValue(
        customerAddress,
        "state"
      ),

      postalCode: nestedValue(
        customerAddress,
        "postal_code"
      ),

      country: nestedValue(
        customerAddress,
        "country"
      ),
    },

    // -----------------------------------
    // BILLING
    // -----------------------------------

    billing: {
      address: nestedValue(
        billingAddress,
        "address"
      ),

      city: nestedValue(
        billingAddress,
        "city"
      ),

      state: nestedValue(
        billingAddress,
        "state"
      ),

      postalCode: nestedValue(
        billingAddress,
        "postal_code"
      ),

      country: nestedValue(
        billingAddress,
        "country"
      ),
    },

    // -----------------------------------
    // SHIPPING
    // -----------------------------------

    shipping: {
      address: nestedValue(
        shippingAddress,
        "address"
      ),

      city: nestedValue(
        shippingAddress,
        "city"
      ),

      state: nestedValue(
        shippingAddress,
        "state"
      ),

      postalCode: nestedValue(
        shippingAddress,
        "postal_code"
      ),

      country: nestedValue(
        shippingAddress,
        "country"
      ),
    },

    // -----------------------------------
    // PAYMENT
    // -----------------------------------

    payment: {
      accountNumber: valueOf(
        payment?.account_number
      ),

      iban: valueOf(
        payment?.iban
      ),

      swift: valueOf(
        payment?.swift
      ),

      routingNumber: valueOf(
        payment?.routing_number
      ),
    },

    items,

    taxes,

    // IMPORTANT:
    // Keep Mindee extracted totals.
    subtotal: numberToString(
      fields?.total_net?.value
    ),

    taxAmount: numberToString(
      fields?.total_tax?.value
    ),

    grandTotal: numberToString(
      fields?.total_amount?.value
    ),
  };
};

// =====================================================
// FIELD
// =====================================================

const FormField = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: any;
  multiline?: boolean;
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value ?? ""}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor="#9CA3AF"
        style={[
          styles.input,
          multiline &&
            styles.multilineInput,
        ]}
      />
    </View>
  );
};

// =====================================================
// SECTION
// =====================================================

const FormSection = ({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {action}
      </View>

      {children}
    </View>
  );
};

// =====================================================
// COMPONENT
// =====================================================

const InvoiceForm: React.FC<
  InvoiceFormProps
> = ({
  mindeeData,
  onSave,
}) => {
  const [form, setForm] =
    useState<InvoiceFormData | null>(
      null
    );

  useEffect(() => {
    if (!mindeeData) {
      setForm(null);
      return;
    }

    console.log(
      "InvoiceForm Mindee Data:",
      JSON.stringify(
        mindeeData,
        null,
        2
      )
    );

    const mapped =
      convertMindeeToForm(
        mindeeData
      );

    console.log(
      "InvoiceForm Mapped Data:",
      JSON.stringify(
        mapped,
        null,
        2
      )
    );

    setForm(mapped);
  }, [mindeeData]);

  // ===================================================
  // ROOT UPDATE
  // ===================================================

  const updateRoot = (
    key:
      | "invoiceNo"
      | "invoiceDate"
      | "dueDate"
      | "poNumber"
      | "documentType"
      | "currency",
    value: string
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  // ===================================================
  // PARTY UPDATE
  // ===================================================

  const updateParty = (
    party: "supplier" | "customer",
    key: keyof Party,
    value: string
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        [party]: {
          ...prev[party],
          [key]: value,
        },
      };
    });
  };

  // ===================================================
  // ADDRESS UPDATE
  // ===================================================

  const updateAddress = (
    type: "billing" | "shipping",
    key: keyof Address,
    value: string
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        [type]: {
          ...prev[type],
          [key]: value,
        },
      };
    });
  };

  // ===================================================
  // PAYMENT UPDATE
  // ===================================================

  const updatePayment = (
    key: keyof Payment,
    value: string
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        payment: {
          ...prev.payment,
          [key]: value,
        },
      };
    });
  };

  // ===================================================
  // ITEM UPDATE
  // ===================================================

  const updateItem = (
    index: number,
    key: keyof InvoiceItem,
    value: string
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      const items = [
        ...prev.items,
      ];

      items[index] = {
        ...items[index],
        [key]: value,
      };

      return {
        ...prev,
        items,
      };
    });
  };

  // ===================================================
  // ADD ITEM
  // ===================================================

  const addItem = () => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        items: [
          ...prev.items,

          {
            id: `item-${Date.now()}`,
            description: "",
            productCode: "",
            quantity: "",
            unit: "",
            rate: "",
            taxRate: "",
            taxAmount: "",
            amount: "",
          },
        ],
      };
    });
  };

  // ===================================================
  // DELETE ITEM
  // ===================================================

  const deleteItem = (
    index: number
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        items: prev.items.filter(
          (_, i) => i !== index
        ),
      };
    });
  };

  // ===================================================
  // TAX UPDATE
  // ===================================================

  const updateTax = (
    index: number,
    key: keyof TaxItem,
    value: string
  ) => {
    setForm((prev) => {
      if (!prev) return prev;

      const taxes = [
        ...prev.taxes,
      ];

      taxes[index] = {
        ...taxes[index],
        [key]: value,
      };

      return {
        ...prev,
        taxes,
      };
    });
  };

  // ===================================================
  // SAVE
  // ===================================================

  const saveInvoice = () => {
    if (!form) return;

    if (!form.invoiceNo) {
      Alert.alert(
        "Validation",
        "Invoice number is required."
      );
      return;
    }

    if (!form.supplier.name) {
      Alert.alert(
        "Validation",
        "Supplier name is required."
      );
      return;
    }

    console.log(
      "FINAL ERP INVOICE:",
      JSON.stringify(
        form,
        null,
        2
      )
    );

    onSave?.(form);
  };

  if (!form) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading invoice...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* ============================================= */}
      {/* INVOICE DETAILS */}
      {/* ============================================= */}

      <FormSection title="Invoice Details">
        <View style={styles.row}>
          <FormField
            label="Invoice Number"
            value={form.invoiceNo}
            onChangeText={(v) =>
              updateRoot(
                "invoiceNo",
                v
              )
            }
          />

          <FormField
            label="Invoice Date"
            value={
              form.invoiceDate
            }
            onChangeText={(v) =>
              updateRoot(
                "invoiceDate",
                v
              )
            }
          />
        </View>

        <View style={styles.row}>
          <FormField
            label="Due Date"
            value={form.dueDate}
            onChangeText={(v) =>
              updateRoot(
                "dueDate",
                v
              )
            }
          />

          <FormField
            label="PO Number"
            value={form.poNumber}
            onChangeText={(v) =>
              updateRoot(
                "poNumber",
                v
              )
            }
          />
        </View>

        <View style={styles.row}>
          <FormField
            label="Document Type"
            value={
              form.documentType
            }
            onChangeText={(v) =>
              updateRoot(
                "documentType",
                v
              )
            }
          />

          <FormField
            label="Currency"
            value={form.currency}
            onChangeText={(v) =>
              updateRoot(
                "currency",
                v
              )
            }
          />
        </View>
      </FormSection>

      {/* ============================================= */}
      {/* SUPPLIER */}
      {/* ============================================= */}

      <FormSection title="Supplier">
        <View style={styles.row}>
          <FormField
            label="Supplier Name"
            value={
              form.supplier.name
            }
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "name",
                v
              )
            }
          />

          <FormField
            label="Phone"
            value={
              form.supplier.phone
            }
            keyboardType="phone-pad"
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "phone",
                v
              )
            }
          />
        </View>

        <View style={styles.row}>
          <FormField
            label="Email"
            value={
              form.supplier.email
            }
            keyboardType="email-address"
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "email",
                v
              )
            }
          />

          <FormField
            label="GSTIN"
            value={
              form.supplier.gstin
            }
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "gstin",
                v
              )
            }
          />
        </View>

        <View style={styles.row}>
          <FormField
            label="TIN"
            value={
              form.supplier.tin
            }
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "tin",
                v
              )
            }
          />

          <FormField
            label="Postal Code"
            value={
              form.supplier
                .postalCode
            }
            keyboardType="numeric"
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "postalCode",
                v
              )
            }
          />
        </View>

        <FormField
          label="Address"
          value={
            form.supplier.address
          }
          multiline
          onChangeText={(v) =>
            updateParty(
              "supplier",
              "address",
              v
            )
          }
        />

        <View style={styles.row}>
          <FormField
            label="City"
            value={
              form.supplier.city
            }
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "city",
                v
              )
            }
          />

          <FormField
            label="State"
            value={
              form.supplier.state
            }
            onChangeText={(v) =>
              updateParty(
                "supplier",
                "state",
                v
              )
            }
          />
        </View>
      </FormSection>

      {/* ============================================= */}
      {/* CUSTOMER */}
      {/* ============================================= */}

      <FormSection title="Customer">
        <View style={styles.row}>
          <FormField
            label="Customer Name"
            value={
              form.customer.name
            }
            onChangeText={(v) =>
              updateParty(
                "customer",
                "name",
                v
              )
            }
          />

          <FormField
            label="Customer ID"
            value={
              form.customer
                .customerId
            }
            onChangeText={(v) =>
              updateParty(
                "customer",
                "customerId",
                v
              )
            }
          />
        </View>

        <FormField
          label="Address"
          value={
            form.customer.address
          }
          multiline
          onChangeText={(v) =>
            updateParty(
              "customer",
              "address",
              v
            )
          }
        />

        <View style={styles.row}>
          <FormField
            label="City"
            value={
              form.customer.city
            }
            onChangeText={(v) =>
              updateParty(
                "customer",
                "city",
                v
              )
            }
          />

          <FormField
            label="State"
            value={
              form.customer.state
            }
            onChangeText={(v) =>
              updateParty(
                "customer",
                "state",
                v
              )
            }
          />

          <FormField
            label="Postal Code"
            value={
              form.customer
                .postalCode
            }
            keyboardType="numeric"
            onChangeText={(v) =>
              updateParty(
                "customer",
                "postalCode",
                v
              )
            }
          />
        </View>
      </FormSection>

      {/* ============================================= */}
      {/* SHIPPING */}
      {/* ============================================= */}

      <FormSection title="Shipping Address">
        <FormField
          label="Address"
          value={
            form.shipping.address
          }
          multiline
          onChangeText={(v) =>
            updateAddress(
              "shipping",
              "address",
              v
            )
          }
        />

        <View style={styles.row}>
          <FormField
            label="City"
            value={
              form.shipping.city
            }
            onChangeText={(v) =>
              updateAddress(
                "shipping",
                "city",
                v
              )
            }
          />

          <FormField
            label="State"
            value={
              form.shipping.state
            }
            onChangeText={(v) =>
              updateAddress(
                "shipping",
                "state",
                v
              )
            }
          />

          <FormField
            label="Postal Code"
            value={
              form.shipping
                .postalCode
            }
            keyboardType="numeric"
            onChangeText={(v) =>
              updateAddress(
                "shipping",
                "postalCode",
                v
              )
            }
          />
        </View>

        <FormField
          label="Country"
          value={
            form.shipping.country
          }
          onChangeText={(v) =>
            updateAddress(
              "shipping",
              "country",
              v
            )
          }
        />
      </FormSection>

      {/* ============================================= */}
      {/* BILLING */}
      {/* ============================================= */}

      <FormSection title="Billing Address">
        <FormField
          label="Address"
          value={
            form.billing.address
          }
          multiline
          onChangeText={(v) =>
            updateAddress(
              "billing",
              "address",
              v
            )
          }
        />

        <View style={styles.row}>
          <FormField
            label="City"
            value={
              form.billing.city
            }
            onChangeText={(v) =>
              updateAddress(
                "billing",
                "city",
                v
              )
            }
          />

          <FormField
            label="State"
            value={
              form.billing.state
            }
            onChangeText={(v) =>
              updateAddress(
                "billing",
                "state",
                v
              )
            }
          />

          <FormField
            label="Postal Code"
            value={
              form.billing
                .postalCode
            }
            keyboardType="numeric"
            onChangeText={(v) =>
              updateAddress(
                "billing",
                "postalCode",
                v
              )
            }
          />
        </View>
      </FormSection>

      {/* ============================================= */}
      {/* PAYMENT */}
      {/* ============================================= */}

      <FormSection title="Payment Details">
        <View style={styles.row}>
          <FormField
            label="Account Number"
            value={
              form.payment
                .accountNumber
            }
            keyboardType="numeric"
            onChangeText={(v) =>
              updatePayment(
                "accountNumber",
                v
              )
            }
          />

          <FormField
            label="Routing Number"
            value={
              form.payment
                .routingNumber
            }
            onChangeText={(v) =>
              updatePayment(
                "routingNumber",
                v
              )
            }
          />
        </View>

        <View style={styles.row}>
          <FormField
            label="IBAN"
            value={
              form.payment.iban
            }
            onChangeText={(v) =>
              updatePayment(
                "iban",
                v
              )
            }
          />

          <FormField
            label="SWIFT"
            value={
              form.payment.swift
            }
            onChangeText={(v) =>
              updatePayment(
                "swift",
                v
              )
            }
          />
        </View>
      </FormSection>

      {/* ============================================= */}
      {/* ITEMS */}
      {/* ============================================= */}

      <FormSection
        title={`Invoice Items (${form.items.length})`}
        action={
          <TouchableOpacity
            style={
              styles.addButton
            }
            onPress={addItem}
          >
            <Text
              style={
                styles.addButtonText
              }
            >
              + Add Item
            </Text>
          </TouchableOpacity>
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            true
          }
        >
          <View style={styles.table}>
            {/* HEADER */}

            <View
              style={[
                styles.tableRow,
                styles.tableHeader,
              ]}
            >
              <Text
                style={[
                  styles.headerCell,
                  styles.descriptionWidth,
                ]}
              >
                Description
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.codeWidth,
                ]}
              >
                Code
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.qtyWidth,
                ]}
              >
                Qty
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.unitWidth,
                ]}
              >
                Unit
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.rateWidth,
                ]}
              >
                Rate
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.taxWidth,
                ]}
              >
                Tax %
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.taxAmountWidth,
                ]}
              >
                Tax Amt
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.amountWidth,
                ]}
              >
                Amount
              </Text>

              <Text
                style={[
                  styles.headerCell,
                  styles.actionWidth,
                ]}
              >
                Action
              </Text>
            </View>

            {/* ROWS */}

            {form.items.map(
              (item, index) => (
                <View
                  key={item.id}
                  style={
                    styles.tableRow
                  }
                >
                  <TextInput
                    value={
                      item.description
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "description",
                        v
                      )
                    }
                    style={[
                      styles.tableInput,
                      styles.descriptionWidth,
                    ]}
                    placeholder="Description"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.productCode
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "productCode",
                        v
                      )
                    }
                    style={[
                      styles.tableInput,
                      styles.codeWidth,
                    ]}
                    placeholder="Code"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.quantity
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "quantity",
                        v
                      )
                    }
                    keyboardType="numeric"
                    style={[
                      styles.tableInput,
                      styles.qtyWidth,
                    ]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.unit
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "unit",
                        v
                      )
                    }
                    style={[
                      styles.tableInput,
                      styles.unitWidth,
                    ]}
                    placeholder="KG"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.rate
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "rate",
                        v
                      )
                    }
                    keyboardType="decimal-pad"
                    style={[
                      styles.tableInput,
                      styles.rateWidth,
                    ]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.taxRate
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "taxRate",
                        v
                      )
                    }
                    keyboardType="decimal-pad"
                    style={[
                      styles.tableInput,
                      styles.taxWidth,
                    ]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.taxAmount
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "taxAmount",
                        v
                      )
                    }
                    keyboardType="decimal-pad"
                    style={[
                      styles.tableInput,
                      styles.taxAmountWidth,
                    ]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={
                      item.amount
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateItem(
                        index,
                        "amount",
                        v
                      )
                    }
                    keyboardType="decimal-pad"
                    style={[
                      styles.tableInput,
                      styles.amountWidth,
                    ]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />

                  <View
                    style={
                      styles.actionWidth
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        deleteItem(
                          index
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </FormSection>

      {/* ============================================= */}
      {/* TAX BREAKDOWN */}
      {/* ============================================= */}

      <FormSection title="Tax Breakdown">
        {form.taxes.length ===
        0 ? (
          <Text
            style={
              styles.emptyText
            }
          >
            No tax breakdown
            available.
          </Text>
        ) : (
          form.taxes.map(
            (tax, index) => (
              <View
                key={tax.id}
                style={
                  styles.taxContainer
                }
              >
                <Text
                  style={
                    styles.taxTitle
                  }
                >
                  Tax {index + 1}
                </Text>

                <View
                  style={
                    styles.row
                  }
                >
                  <FormField
                    label="Rate %"
                    value={
                      tax.rate
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateTax(
                        index,
                        "rate",
                        v
                      )
                    }
                  />

                  <FormField
                    label="Base"
                    value={
                      tax.base
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateTax(
                        index,
                        "base",
                        v
                      )
                    }
                  />

                  <FormField
                    label="Amount"
                    value={
                      tax.amount
                    }
                    onChangeText={(
                      v
                    ) =>
                      updateTax(
                        index,
                        "amount",
                        v
                      )
                    }
                  />
                </View>
              </View>
            )
          )
        )}
      </FormSection>

      {/* ============================================= */}
      {/* SUMMARY */}
      {/* ============================================= */}

      <FormSection title="Invoice Summary">
        <View
          style={
            styles.summary
          }
        >
          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Subtotal / Net
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {form.currency}{" "}
              {form.subtotal ||
                "0.00"}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Tax
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {form.currency}{" "}
              {form.taxAmount ||
                "0.00"}
            </Text>
          </View>

          <View
            style={[
              styles.summaryRow,
              styles.grandTotalRow,
            ]}
          >
            <Text
              style={
                styles.grandTotalLabel
              }
            >
              Grand Total
            </Text>

            <Text
              style={
                styles.grandTotalValue
              }
            >
              {form.currency}{" "}
              {form.grandTotal ||
                "0.00"}
            </Text>
          </View>
        </View>
      </FormSection>

      {/* ============================================= */}
      {/* SAVE */}
      {/* ============================================= */}

      <TouchableOpacity
        style={
          styles.saveButton
        }
        activeOpacity={0.8}
        onPress={saveInvoice}
      >
        <Text
          style={
            styles.saveButtonText
          }
        >
          Save Invoice
        </Text>
      </TouchableOpacity>

      <View
        style={
          styles.bottomSpace
        }
      />
    </ScrollView>
  );
};

export default InvoiceForm;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    padding: 12,
    paddingBottom: 30,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,

    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    marginHorizontal: -5,
  },

  field: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 5,
  },

  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  multilineInput: {
    minHeight: 75,
    paddingTop: 10,
    textAlignVertical: "top",
  },

  addButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  table: {
    minWidth: 1030,
  },

  tableRow: {
    flexDirection: "row",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },

  tableHeader: {
    minHeight: 44,
    backgroundColor: "#F3F4F6",
  },

  headerCell: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  tableInput: {
    height: 42,
    margin: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    paddingHorizontal: 7,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  descriptionWidth: {
    width: 220,
  },

  codeWidth: {
    width: 110,
  },

  qtyWidth: {
    width: 70,
  },

  unitWidth: {
    width: 80,
  },

  rateWidth: {
    width: 100,
  },

  taxWidth: {
    width: 80,
  },

  taxAmountWidth: {
    width: 100,
  },

  amountWidth: {
    width: 110,
  },

  actionWidth: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 6,
  },

  deleteText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700",
  },

  taxContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 5,
    marginBottom: 8,
  },

  taxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  summary: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 9,
    overflow: "hidden",
  },

  summaryRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  grandTotalRow: {
    minHeight: 58,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 0,
  },

  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  grandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  saveButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 30,
  },
});
//https://app.mindee.com/extraction