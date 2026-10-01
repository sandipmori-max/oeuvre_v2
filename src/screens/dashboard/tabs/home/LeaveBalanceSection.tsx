import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useAppSelector } from '../../../../store/hooks';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LeaveItem {
    name: string;
    taken: number;
    total: number;
    takeLeave: number;
    balance: number;
    icon: string;
    color: string;
}

interface LeaveBalanceSectionProps {
    listLeaveBalData?: any[];
}

const LeaveBalanceSection = ({
    listLeaveBalData,
}: LeaveBalanceSectionProps) => {
    const theme = useAppSelector((state) => state?.theme?.mode);

    const isDark = theme === 'dark';

    const [showAllLeaves, setShowAllLeaves] = useState(false);

    const slideAnim = useRef(
        new Animated.Value(SCREEN_HEIGHT),
    ).current;

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE DATA
    |--------------------------------------------------------------------------
    */

    const employee = listLeaveBalData?.[0] || {};

    /*
    |--------------------------------------------------------------------------
    | SAFE NUMBER
    |--------------------------------------------------------------------------
    */

    const getNumber = (value: any): number => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return 0;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : 0;
    };

    /*
    |--------------------------------------------------------------------------
    | CURRENT / BALANCE VALUES
    |--------------------------------------------------------------------------
    */

    const pl = getNumber(employee?.pl);
    const cl = getNumber(employee?.cl);
    const sl = getNumber(employee?.sl);
    const lwp = getNumber(employee?.lwp);
    const co = getNumber(employee?.co);
    const ml = getNumber(employee?.ml);
    const ol = getNumber(employee?.ol);
    const bd = getNumber(employee?.bd);
    const plb = getNumber(employee?.plb);

    /*
    |--------------------------------------------------------------------------
    | TOTAL / ENTITLEMENT VALUES
    |--------------------------------------------------------------------------
    */

    const tpl = getNumber(employee?.tpl);
    const tcl = getNumber(employee?.tcl);
    const tsl = getNumber(employee?.tsl);
    const tlwp = getNumber(employee?.tlwp);
    const tco = getNumber(employee?.tco);
    const tml = getNumber(employee?.tml);
    const tol = getNumber(employee?.tol);
    const tbd = getNumber(employee?.tbd);
    const tplb = getNumber(employee?.tplb);

    /*
    |--------------------------------------------------------------------------
    | LEAVE DATA
    |--------------------------------------------------------------------------
    |
    | balance = current value
    | total   = total entitlement
    |
    | "" and 0 are NOT removed.
    |
    */

    const leaveData: LeaveItem[] = [
        {
            name: 'Casual Leave (CL)',
            taken: 0,
            total: tcl,
            takeLeave : cl,
            balance: (tcl - cl),
            icon: 'event',
            color: '#20B95A',
        },
        {
            name: 'Privilege Leave (PL)',
            taken: 0,
            total: tpl,
             takeLeave : pl,
            balance: (tpl - pl),
            icon: 'flight-takeoff',
            color: '#1677FF',
        },
        {
            name: 'Sick Leave (SL)',
            taken: 0,
            total: tsl,
            balance: tsl - sl,
             takeLeave : sl,
            icon: 'vaccines',
            color: '#FF8C1A',
        },
        {
            name: 'Comp Off (CO)',
            taken: 0,
            total: tco,
            balance: tco - co,
             takeLeave : co,
            icon: 'access-time',
            color: '#13A6A0',
        },
        {
            name: 'Medical Leave (ML)',
            taken: 0,
            total: tml,
            balance: tml - ml,
             takeLeave : ml,
            icon: 'medical-services',
            color: '#E53935',
        },
        {
            name: 'Other Leave (OL)',
            taken: 0,
            total: tol,
            balance: tol - ol,
             takeLeave : ol,
            icon: 'event-note',
            color: '#8E44AD',
        },
        {
            name: 'PL Balance (PLB)',
            taken: 0,
            total: tplb,
            balance: tplb - plb,
             takeLeave : plb,
            icon: 'account-balance-wallet',
            color: '#5E35B1',
        },
        {
            name: 'Birthday Leave (BD)',
            taken: 0,
            total: tbd,
             takeLeave : bd,
            balance: tbd - bd,
            icon: 'cake',
            color: '#F06292',
        },
        {
            name: 'Leave Without Pay (LWP)',
            taken: 0,
            total: tlwp,
             takeLeave : lwp,
            balance: tlwp - lwp,
            icon: 'money-off',
            color: '#795548',
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | ALL LEAVES
    |--------------------------------------------------------------------------
    |
    | Koi bhi leave remove nahi hoga.
    | "" -> 0
    | 0  -> 0
    |
    */

    const availableLeaveData = leaveData;

    /*
    |--------------------------------------------------------------------------
    | FIRST 4
    |--------------------------------------------------------------------------
    */

    const visibleLeaveData = availableLeaveData.slice(0, 3);

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    const totalEntitlement = availableLeaveData.reduce(
        (sum, item) => sum + item.total,
        0,
    );

    const totalBalance = availableLeaveData.reduce(
        (sum, item) => sum + item.balance,
        0,
    );

    /*
    |--------------------------------------------------------------------------
    | TAKEN
    |--------------------------------------------------------------------------
    |
    | Current API me taken field nahi aa raha.
    | Isliye abhi 0.
    |
    */

    const totalTaken = availableLeaveData.reduce(
        (sum, item) => sum + item.taken,
        0,
    );

    const summaryData = [
        {
            title: 'Total\nEntitlement',
            value: totalEntitlement,
            icon: 'calendar-month',
            color: '#1683F7',
        },
        {
            title: 'Leaves\nTaken',
            value: totalTaken,
            icon: 'check-circle-outline',
            color: '#20B95A',
        },
        {
            title: 'Leaves\nPending',
            value: 0,
            icon: 'hourglass-disabled',
            color: '#FF921E',
        },
        {
            title: 'Leaves\nBalance',
            value: totalBalance,
            icon: 'account-balance-wallet',
            color: '#9254DE',
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | OPEN BOTTOM SHEET
    |--------------------------------------------------------------------------
    */

    const openBottomSheet = () => {
        setShowAllLeaves(true);

        requestAnimationFrame(() => {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        });
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE BOTTOM SHEET
    |--------------------------------------------------------------------------
    */

    const closeBottomSheet = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setShowAllLeaves(false);
        });
    };

    /*
    |--------------------------------------------------------------------------
    | LEAVE ROW
    |--------------------------------------------------------------------------
    */

    const renderLeaveRow = (
        item: LeaveItem,
        index: number,
        isBottomSheet: boolean = false,
    ) => {
        /*
        | Current balance ke basis par progress.
        |
        | Example:
        | SL = 2
        | TSL = 20
        |
        | Progress = 2 / 20 = 10%
        */

        const percentage =
            item.total > 0
                ? Math.min(
                      (item.balance / item.total) * 100,
                      100,
                  )
                : 0;

        const totalRows = isBottomSheet
            ? availableLeaveData.length
            : visibleLeaveData.length;

        return (
            <TouchableOpacity
                key={`${item.name}-${index}`}
                activeOpacity={0.75}
                style={[
                    styles.leaveRow,
                    {
                        borderBottomColor: isDark
                            ? '#333333'
                            : '#F0F2F5',
                    },
                    index === totalRows - 1 && {
                        borderBottomWidth: 0,
                    },
                ]}
            >
                {/* ICON */}
                <View
                    style={[
                        styles.leaveIcon,
                        {
                            backgroundColor: isDark
                                ? '#292929'
                                : '#F5F5F5',
                        },
                    ]}
                >
                    <MaterialIcons
                        name={item.icon}
                        size={21}
                        color={item.color}
                    />
                </View>

                {/* CONTENT */}
                <View style={styles.leaveContent}>
                    <Text
                        style={[
                            styles.leaveName,
                            {
                                color: isDark
                                    ? '#FFFFFF'
                                    : '#26364A',
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>

                    <Text
                        style={[
                            styles.takenText,
                            {
                                color: isDark
                                    ? '#AEB6C2'
                                    : '#7B8797',
                            },
                        ]}
                    >
                        {item.total} / {item.takeLeave} Balance
                    </Text>

                    {/* PROGRESS BAR */}
                    <View
                        style={[
                            styles.progressBackground,
                            {
                                backgroundColor: isDark
                                    ? '#333333'
                                    : '#EDF0F4',
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${percentage}%`,
                                    backgroundColor: item.color,
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* BALANCE */}
                <View style={styles.balanceContainer}>
                    <Text
                        style={[
                            styles.balanceValue,
                            {
                                color: item.color,
                            },
                        ]}
                    >
                        {item.balance}
                    </Text>

                    <Text
                        style={[
                            styles.balanceLabel,
                            {
                                color: isDark
                                    ? '#AEB6C2'
                                    : '#667386',
                            },
                        ]}
                    >
                        Balance
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: isDark
                            ? '#121212'
                            : '#FFFFFF',
                    },
                ]}
            >
               

                {/* ==================================================
                    DETAILS HEADER
                ================================================== */}

                <View
                    style={[
                        styles.sectionHeader,
                        styles.detailsHeader,
                        {
                            backgroundColor: isDark
                                ? '#333333'
                                : '#F5F5F5',
                        },
                    ]}
                >
                    <View style={styles.sectionHeaderLeft}>
                        <MaterialIcons
                            name="dashboard"
                            size={14}
                            color={
                                isDark
                                    ? '#FFFFFF'
                                    : '#707070'
                            }
                        />

                        <Text
                            style={[
                                styles.sectionHeaderText,
                                {
                                    color: isDark
                                        ? '#FFFFFF'
                                        : '#000000',
                                },
                            ]}
                        >
                            Leave Balance Details
                        </Text>
                    </View>
                </View>

                {/* ==================================================
                    FIRST 4 LEAVES
                ================================================== */}

                <View
                    style={[
                        styles.leaveCard,
                        {
                            backgroundColor: isDark
                                ? '#1E1E1E'
                                : '#FFFFFF',
                            borderColor: isDark
                                ? '#333333'
                                : '#EEF1F5',
                        },
                    ]}
                >
                    {visibleLeaveData.map((item, index) =>
                        renderLeaveRow(item, index),
                    )}
                </View>

                {/* ==================================================
                    VIEW MORE
                ================================================== */}

                {availableLeaveData.length > 4 && (
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={openBottomSheet}
                        style={[
                            styles.viewMoreButton,
                            {
                                backgroundColor: isDark
                                    ? '#1E1E1E'
                                    : '#FFFFFF',
                                borderColor: isDark
                                    ? '#333333'
                                    : '#E5EAF0',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.viewMoreText,
                                {
                                    color: isDark
                                        ? '#FFFFFF'
                                        : '#1683F7',
                                },
                            ]}
                        >
                            View more
                        </Text>

                       

                        <MaterialIcons
                            name="keyboard-arrow-down"
                            size={20}
                            color={
                                isDark
                                    ? '#FFFFFF'
                                    : '#1683F7'
                            }
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* ======================================================
                BOTTOM SHEET
            ====================================================== */}

            <Modal
                visible={showAllLeaves}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={closeBottomSheet}
            >
                <View style={styles.modalRoot}>
                    {/* BACKDROP */}
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={closeBottomSheet}
                    />

                    {/* SHEET */}
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                backgroundColor: isDark
                                    ? '#1A1A1A'
                                    : '#FFFFFF',
                                transform: [
                                    {
                                        translateY: slideAnim,
                                    },
                                ],
                            },
                        ]}
                    >
                        {/* HANDLE */}
                        <View style={styles.dragHandle} />

                        {/* HEADER */}
                        <View
                            style={[
                                styles.sheetHeader,
                                {
                                    borderBottomColor: isDark
                                        ? '#333333'
                                        : '#EEF1F5',
                                },
                            ]}
                        >
                            <View
                                style={
                                    styles.sheetTitleContainer
                                }
                            >
                                <Text
                                    style={[
                                        styles.sheetTitle,
                                        {
                                            color: isDark
                                                ? '#FFFFFF'
                                                : '#26364A',
                                        },
                                    ]}
                                >
                                    Leave Balance
                                </Text>

                                <Text
                                    style={[
                                        styles.sheetSubtitle,
                                        {
                                            color: isDark
                                                ? '#9CA5B1'
                                                : '#7B8797',
                                        },
                                    ]}
                                >
                                    {availableLeaveData.length}{' '}
                                    leave types
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={closeBottomSheet}
                                style={[
                                    styles.closeButton,
                                    {
                                        backgroundColor: isDark
                                            ? '#333333'
                                            : '#F3F5F7',
                                    },
                                ]}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={20}
                                    color={
                                        isDark
                                            ? '#FFFFFF'
                                            : '#526070'
                                    }
                                />
                            </TouchableOpacity>
                        </View>

                        {/* ALL LEAVES */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            contentContainerStyle={
                                styles.sheetScrollContent
                            }
                        >
                            <View
                                style={[
                                    styles.sheetLeaveCard,
                                    {
                                        backgroundColor: isDark
                                            ? '#222222'
                                            : '#FFFFFF',
                                        borderColor: isDark
                                            ? '#333333'
                                            : '#EEF1F5',
                                    },
                                ]}
                            >
                                {availableLeaveData.map(
                                    (item, index) =>
                                        renderLeaveRow(
                                            item,
                                            index,
                                            true,
                                        ),
                                )}
                            </View>

                            <View
                                style={styles.sheetBottomSpace}
                            />
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
};

export default LeaveBalanceSection;

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 12, 
        paddingBottom: 20,
    },

    /* ============================================================
       HEADER
    ============================================================ */

    sectionHeader: {
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
    },

    detailsHeader: {
        marginTop: 10,
        marginBottom: 10,
    },

    sectionHeaderLeft: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },

    sectionHeaderText: {
        fontSize: 13,
        fontWeight: '600',
    },

    /* ============================================================
       SUMMARY
    ============================================================ */

    summaryContainer: {
        flexDirection: 'row',
        width: '100%',
    },

    summaryCard: {
        flex: 1,
        minHeight: 82,
        paddingVertical: 8,
        marginHorizontal: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 7,
    },

    summaryIcon: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryValue: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: '700',
    },

    summaryLabel: {
        marginTop: 2,
        fontSize: 10,
        textAlign: 'center',
    },

    /* ============================================================
       LEAVE CARD
    ============================================================ */

    leaveCard: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 7,
        overflow: 'hidden',
    },

    leaveRow: {
        minHeight: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },

    leaveIcon: {
        width: 35,
        height: 35,
        marginRight: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    leaveContent: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },

    leaveName: {
        fontSize: 13,
        fontWeight: '600',
    },

    takenText: {
        marginTop: 2,
        fontSize: 10,
    },

    progressBackground: {
        width: '100%',
        height: 3,
        marginTop: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 10,
    },

    balanceContainer: {
        width: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 3,
    },

    balanceValue: {
        fontSize: 15,
        fontWeight: '700',
    },

    balanceLabel: {
        marginTop: 1,
        fontSize: 8,
    },

    /* ============================================================
       VIEW MORE
    ============================================================ */

    viewMoreButton: {
        minHeight: 42,
        marginTop: 8,
        borderRadius: 4,
        borderWidth: 0.6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },

    viewMoreText: {
        fontSize: 12,
        fontWeight: '600',
    },

    viewMoreCount: {
        minWidth: 25,
        height: 22,
        marginLeft: 7,
        paddingHorizontal: 6,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    viewMoreCountText: {
        fontSize: 10,
        fontWeight: '700',
    },

    /* ============================================================
       MODAL
    ============================================================ */

    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.50)',
    },

    /* ============================================================
       BOTTOM SHEET
    ============================================================ */

    bottomSheet: {
        width: '100%',
        maxHeight: SCREEN_HEIGHT * 0.82,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },

    dragHandle: {
        width: 42,
        height: 4,
        borderRadius: 10,
        backgroundColor: '#AEB4BC',
        alignSelf: 'center',
        marginTop: 9,
        marginBottom: 6,
    },

    sheetHeader: {
        minHeight: 66,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },

    sheetTitleContainer: {
        flex: 1,
    },

    sheetTitle: {
        fontSize: 17,
        fontWeight: '700',
    },

    sheetSubtitle: {
        marginTop: 3,
        fontSize: 11,
    },

    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },

    sheetScrollContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 30,
    },

    sheetLeaveCard: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },

    sheetBottomSpace: {
        height: 20,
    },
});