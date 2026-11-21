import { View, Text, TextInput, Pressable, ScrollView, Keyboard, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function TherapyFormScreen({ route, navigation }) {
    const { therapyId } = route.params ?? {};
    const isEditing = Boolean(therapyId);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [errors, setErrors] = useState({});
    const [therapyType, setTherapyType] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [saving, setSaving] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if(!isEditing) return;

        let active = true;

        const loadTherapy = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (!active) return;

            if (userError || !user) {
                setErrors(prev => ({
                    ...prev,
                    server: 'Please log in again.',
                }));
                return;
            }

            const { data, error } = await supabase
                .from('therapies')
                .select('*')
                .eq('id', therapyId)
                .eq('user_id', user.id)
                .single();

            if (!active) return;

            if(error) {
                setErrors(prev => ({
                ...prev,
                server: error.message,
               }));
               return;
            }

            setName(data.name ?? '');
            setTherapyType(data.therapy_type ?? '');
            setDescription(data.description ?? '');
            setDuration(String(data.duration ?? ''));

            if (data.start_date) {
                const [year, month, day] =
                    data.start_date.split('-').map(Number);

                setStartDate(new Date(year, month - 1, day));
            }
        };
        loadTherapy();

        return () => {
            active = false;
        };
    }, [isEditing, therapyId]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            'keyboardDidShow',
            (event) => {
                setKeyboardHeight(event.endCoordinates.height);
            }
        );

        const hideSubscription = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        }
    }, []);

    const openDatePicker = () => {
        DateTimePickerAndroid.open({
            value: startDate,
            mode: 'date',
            display: 'default',

            onChange: (event, selectedDate) => {
                if (event.type === 'set' && selectedDate != null) {
                   setStartDate(selectedDate);
                }

            },
        });
    };

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

        if (!therapyType) {
            newErrors.therapyType = 'Please select a therapy type.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSave = async () => {
        if (saving || !validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const { data: { user }, error: userError } =
                await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error('Please log in again.');
            }

            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;

            const therapyData = {
                name: name.trim(),
                therapy_type: therapyType,
                description: description.trim(),
                duration: Number(duration),
                start_date: formattedDate,
            };

            let result;

            if (isEditing) {
                // UPDATE existing therapy
                result = await supabase
                    .from('therapies')
                    .update(therapyData)
                    .eq('id', therapyId)
                    .eq('user_id', user.id)
                    .select('id')
                    .single();

            } else {
                // CREATE new therapy
                result = await supabase
                    .from('therapies')
                    .insert({
                        ...therapyData,
                        user_id: user.id,
                    })
                    .select('id')
                    .single();
            }

            if (result.error) {
                throw result.error;
            }

            console.log(
                isEditing
                    ? 'Therapy updated successfully!'
                    : 'Therapy created successfully!'
            );

            if (isEditing) {
                navigation.goBack();
            } else {
                setName('');
                setTherapyType('');
                setDescription('');
                setDuration('');
                setStartDate(new Date());
                setErrors({});
            }

        } catch (error) {
            setErrors(prev => ({
                ...prev,
                server: error.message || 'Failed to save therapy.',
            }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <View
            style={styles.container}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingBottom: 100 + keyboardHeight,
                    }
                ]}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={true}

            >
            <Text style={styles.heading}> {isEditing ? 'Edit Therapy' : 'Create New Therapy'}</Text>
                <Text style={styles.subtitle}>
                    {isEditing
                        ? 'Update your therapy information.'
                        : 'Add information about your therapy session.'}
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

            <Text style={styles.label}>Therapy Type *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                   selectedValue={therapyType}
                   onValueChange={(value) => {
                    setTherapyType(value);
                    if (errors.therapyType) {
                        setErrors((prev) => ({
                            ...prev,
                            therapyType: '',
                        }));
                    }
                   }}
                   style={styles.picker}
                >
                    <Picker.Item label="Select therapy type..." value="" />
                    <Picker.Item label='Speech Therapy' value="speech" />
                    <Picker.Item label='Physical Therapy' value="physical" />
                    <Picker.Item label='Occupational Therapy' value="occupational" />
                    <Picker.Item label='Psycological Therapy' value="psychological" />
                    <Picker.Item label='Other' value="other" />
                </Picker>
            </View>

            {errors.therapyType ? (
                <Text style={styles.errorText}>{errors.therapyType}</Text>
            ) : null}
            <Text style={styles.label}>Start Date *</Text>
            <Pressable
                style={styles.dateButton}
                onPress={openDatePicker}
            >
                <Text style={styles.dateText}>
                    {startDate.toLocaleDateString('bg-BG')}
                </Text>
             </Pressable>

            <Text style={styles.label}>Description *</Text>
            <TextInput
               style={[styles.input, styles.textArea]}
               placeholder='Describe your therapy...'
               value={description}
               onChangeText={setDescription}
               multiline
               textAlignVertical='top'
            />
                {errors.description ? (
                    <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}
            <Text style={styles.label}>Duration (minutes) *</Text>
            <TextInput
              style={styles.input}
              placeholder='e.g. 30'
              value={duration}
              onChangeText={setDuration}
              keyboardType='number-pad'
            />
                {errors.duration ? (
                    <Text style={styles.errorText}>{errors.duration}</Text>
                ) : null}

                {errors.server ? (
                    <Text style={styles.errorText}>
                        {errors.server}
                    </Text>
                ) : null}

                <Pressable
                    style={[styles.button, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isEditing ? 'Update Therapy' : 'Save Therapy'}
                        </Text>
                    )}
                </Pressable>
            </ScrollView>
       </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FAF6',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
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
    pickerContainer: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#C8DCD0',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    dateButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#C8DCD0',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
});
