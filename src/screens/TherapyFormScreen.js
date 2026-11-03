import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function TherapyFormScreen() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if(!name.trim()){
            newErrors.name = 'Therapy name is required.';
        } else if (name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters.';
        }

        if(!description.trim()) {
            newErrors.description = 'Description is required.';
        }

        if(!duration.trim()) {
            newErrors.duration = 'Duration is required.';
        } else if (
            !Number.isInteger(Number(duration)) ||
            Number(duration) <= 0
        ) {
            newErrors.duration = 'Ente a valid duration in minutes.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSave = () => {
       if (!validateForm()) {
         return;
       }

       console.log('Form validation successful');
    }

    return (
       <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
       >
        <ScrollView
           contentContainerStyle={styles.content}
           keyboardShouldPersistTaps='handled'
        >
            <Text style={styles.heading}>Create New Therapy</Text>
            <Text style={styles.subtitle}>
                Add information about your therapy session.
            </Text>
            <Text style={styles.label}>Therapy Name *</Text>
            <TextInput
                style={styles.input}
                placeholder='e.g. Speech Therapy'
                value={name}
                onChangeText={setName}
            />
                {errors.name ? (
                    <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
            <Text style={styles.label}>Description *</Text>
            <TextInput
               style={[styles.input, styles.textArea]}
               placeholder='Describe your therapy...'
               value={description}
               onChangeText={setDescription}
               multiline
               textAlignVertical='top'
            />
                {errors.name ? (
                    <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
            <Text style={styles.label}>Duration (minutes) *</Text>
            <TextInput
              style={styles.input}
              placeholder='e.g. 30'
              value={duration}
              onChangeText={setDuration}
              keyboardType='number-pad'
            />
                {errors.name ? (
                    <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}

            <Pressable style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Therapy</Text>
            </Pressable>
        </ScrollView>
       </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FAF6',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#237A57',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#C8DCD0',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 110,
    },
    button: {
        backgroundColor: '#237A57',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputError: {
        borderColor: '#D64545',
    },
    errorText: {
        color: '#D64545',
        fontSize: 13,
        marginTop: -14,
        marginBottom: 14,
    },
});
