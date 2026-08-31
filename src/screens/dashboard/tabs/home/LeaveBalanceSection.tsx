import MaterialIcons from '@react-native-vector-icons/material-icons';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useAppSelector } from '../../../../store/hooks';

const { width } = Dimensions.get('window');

const summaryData = [
    {
        title: 'Total \nEntitlement',
        value: '0',
        icon: 'calendar-month',
        color: '#1683F7',
    },
    {
        title: 'Leaves \nTaken',
        value: '0',
        icon: 'check-circle-outline',
        color: '#20B95A',
    },
    {
        title: 'Leaves \nPending',
        value: '0',
        icon: 'hourglass-disabled',
        color: '#FF921E',
    },
    {
        title: 'Leaves \nBalance',
        value: '0',
        icon: 'account-balance-wallet',
        color: '#9254DE',
    },
];

const leaveData = [
    {
        name: 'Casual Leave (CL)',
        taken: 0,
        total: 0,
        balance: 0,
        icon: 'compost',
        color: '#20B95A',
    },
    {
        name: 'Privilege Leave (PL)',
        taken: 0,
        total: 0,
        balance: 0,
        icon: 'flight-takeoff',
        color: '#1677FF',
    },
    {
        name: 'Sick Leave (SL)',
        taken: 0,
        total: 0,
        balance: 0,
        icon: 'vaccines',
        color: '#FF8C1A',
    },
    {
        name: 'Comp Off (CO)',
        taken: 0,
        total: 0,
        balance: 0,
        icon: 'clock-outline',
        color: '#13A6A0',
    },
];

const LeaveBalanceSection = () => {

    const theme = useAppSelector((state) => state?.theme.mode);
    return (
        <View style={styles.container}>

            {/* =====================================================
          LEAVE SUMMARY
      ===================================================== */}

            <View
                style={{
                    marginBottom: 10,
                    backgroundColor:
                        theme === "dark" ? "gray" : "#f5f5f5",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 8,
                    borderRadius: 4,
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 4,
                    }}
                >
                    <MaterialIcons
                        size={14}
                        color={
                            theme === "dark" ? "white" : "gray"
                        }
                        name="dashboard"
                    />
                    <Text
                        style={{
                            color:
                                theme === "dark" ? "white" : "black",
                            fontWeight: "600",
                        }}
                    >
                        Leave Summary
                    </Text>
                </View>


            </View>

            <View style={styles.summaryContainer}>
                {summaryData.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.summaryCard,
                            index === summaryData.length - 1 && {
                                marginRight: 0,
                            },
                        ]}>
                        <View
                            style={[
                                styles.leaveIcon,
                                {
                                    backgroundColor: "#f5f5f5",
                                },
                            ]}>

                            <MaterialIcons
                                name={item.icon}
                                size={22}
                                color={item.color}
                            />
                        </View>


                        <Text style={styles.summaryValue}>
                            {item.value}
                        </Text>

                        <Text
                            style={styles.summaryLabel}
                            numberOfLines={2}>
                            {item.title}
                        </Text>
                    </View>
                ))}
            </View>

            {/* =====================================================
          LEAVE BALANCE DETAILS
      ===================================================== */}


            <View
                style={{
                    marginVertical: 10,
                    backgroundColor:
                        theme === "dark" ? "gray" : "#f5f5f5",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 8,
                    borderRadius: 4,
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 4,
                    }}
                >
                    <MaterialIcons
                        size={14}
                        color={
                            theme === "dark" ? "white" : "gray"
                        }
                        name="dashboard"
                    />
                    <Text
                        style={{
                            color:
                                theme === "dark" ? "white" : "black",
                            fontWeight: "600",
                        }}
                    >
                        Leave Balance Details
                    </Text>
                </View>
            </View>

            <View style={styles.leaveCard}>
                {leaveData.map((item, index) => {

                    const percentage =
                        item.total > 0
                            ? (item.taken / item.total) * 100
                            : 0;

                    return (
                        <TouchableOpacity
                            activeOpacity={0.75}
                            key={item.name}
                            style={[
                                styles.leaveRow,
                                index === leaveData.length - 1 && {
                                    borderBottomWidth: 0,
                                },
                            ]}>

                            {/* Icon */}
                            <View
                                style={[
                                    styles.leaveIcon,
                                    {

                                        marginRight: 10,
                                        backgroundColor: "#f5f5f5",
                                    },
                                ]}>
                                <MaterialIcons
                                    name={item.icon}
                                    size={22}
                                    color={item?.color}
                                />
                            </View>

                            {/* Center Content */}
                            <View style={styles.leaveContent}>

                                <Text
                                    style={styles.leaveName}
                                    numberOfLines={1}>
                                    {item.name}
                                </Text>

                                <Text style={styles.takenText}>
                                    {item.taken} / {item.total} Taken
                                </Text>

                                {/* Progress */}
                                <View style={styles.progressBackground}>
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

                            {/* Balance */}
                            <View style={styles.balanceContainer}>
                                <Text
                                    style={[
                                        styles.balanceValue,
                                        {
                                            color: item.color,
                                        },
                                    ]}>
                                    {item.balance}
                                </Text>

                                <Text style={styles.balanceLabel}>
                                    Balance
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default LeaveBalanceSection;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#26364A',
        marginBottom: 10,
    },

    summaryContainer: {
        flexDirection: 'row',
        width: '100%',
    },

    summaryCard: {
        flex: 1,
        minHeight: 74,
        paddingVertical: 8,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EEF1F5',
        borderRadius: 6,
    },

    summaryValue: {
        marginVertical: 6,
        fontSize: 16,
        fontWeight: '600',
        color: '#26364A',
    },

    summaryLabel: {
        fontSize: 12,
        color: '#68778A',

        textAlign: 'center',
    },

    /* ===================================================
       DETAILS
    =================================================== */

    detailsTitle: {
        marginTop: 22,
        marginBottom: 10,
    },

    leaveCard: {
        width: '100%',

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#EEF1F5',

        borderRadius: 6,

        overflow: 'hidden',

    },

    leaveRow: {
        minHeight: 67,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 10,
        paddingVertical: 8,

        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
    },

    /* ===================================================
       LEAVE ICON
    =================================================== */

    leaveIcon: {
        width: 34,
        height: 34,

        borderRadius: 8,

        alignItems: 'center',
        justifyContent: 'center',

    },

    /* ===================================================
       CONTENT
    =================================================== */

    leaveContent: {
        flex: 1,

        justifyContent: 'center',

        marginRight: 8,
    },

    leaveName: {

        fontWeight: '600',

        color: '#26364A',
    },

    takenText: {
        marginTop: 1,


        color: '#7B8797',
    },

    /* ===================================================
       PROGRESS BAR
    =================================================== */

    progressBackground: {
        width: '100%',
        height: 3,

        marginTop: 5,

        borderRadius: 10,

        backgroundColor: '#EDF0F4',

        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',

        borderRadius: 10,
    },

    /* ===================================================
       BALANCE
    =================================================== */

    balanceContainer: {
        width: 38,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 3,
    },

    balanceValue: {

        fontWeight: '700',
    },

    balanceLabel: {
        marginTop: 1,
        fontSize: 8,
        color: '#667386',
    },
});