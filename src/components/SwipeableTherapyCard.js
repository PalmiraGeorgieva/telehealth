import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRef } from 'react';
import { Ionicons } from "@expo/vector-icons";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useAppTheme } from "../theme/ThemeContext";

export default function SwipeableTherapyCard({ children, onEdit, onDelete }) {
    const { theme, isDark } = useAppTheme();
    const styles = createStyles(theme, isDark);
    const swipeableRef = useRef(null);

    const renderRightActions = () => (

        <View style={styles.actions}>
            <Pressable style={[styles.actionButton, styles.editButton]} onPress={() => { swipeableRef.current?.close(); onEdit(); }}>
                <Ionicons name="create-outline" size={24} color={isDark ? theme.background : '#fff'} />
                <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => { swipeableRef.current?.close(); onDelete(); }}>
                <Ionicons name="trash-outline" size={24} color={isDark ? theme.background : '#fff'} />
                <Text style={styles.actionText}>Delete</Text>
            </Pressable>
        </View>
    );

    return (
        <ReanimatedSwipeable ref={swipeableRef}
           renderRightActions={renderRightActions}
           overshootRight={false}
           friction={2}
           rightThreshold={40}
        >
            {children}
        </ReanimatedSwipeable>
    );


}
const createStyles = (theme, isDark) => StyleSheet.create({
        actions: {
            flexDirection: 'row',
            gap: 6,
            paddingLeft: 6,
            marginBottom: 12,
        },
        actionButton: {
            width: 70,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
        },
        editButton: {
            backgroundColor: theme.primary,
        },
        deleteButton: {
            backgroundColor: theme.danger,
        },
        actionText: {
            color: isDark ? theme.background : '#fff',
            fontSize: 12,
            fontWeight: '600',
        },
    })
