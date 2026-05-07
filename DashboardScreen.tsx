import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Pill, MessageSquare, Bell, ChevronRight, Activity, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api'; // On suppose que ce helper API existe

interface UserStats {
    full_name: string;
    prescription_count: number;
    appointment_count: number;
}

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                // Note: L'endpoint /users/me/stats est hypothétique et doit être créé côté backend
                const response = await api.get('/users/me/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch user stats:", error);
                // En cas d'erreur, on utilise des données par défaut
                setStats({ full_name: 'Utilisateur', prescription_count: 0, appointment_count: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchUserStats();
    }, []);

    const handlePress = (route: string) => {
        // On suppose que ces écrans existent dans le navigateur
        navigation.navigate(route);
    };

    if (loading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#10b981" /></View>;
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Tableau de Bord</Text>
                    <Text style={styles.headerSubtitle}>Bonjour, {stats?.full_name?.split(' ')[0] || 'Utilisateur'} !</Text>
                </View>
                <TouchableOpacity style={styles.notificationIcon}>
                    <Bell color="#059669" size={24} />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats?.prescription_count ?? 0}</Text>
                    <Text style={styles.statLabel}>Ordonnances</Text>
                    <Pill color="#059669" size={24} style={styles.statIcon} />
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats?.appointment_count ?? 0}</Text>
                    <Text style={styles.statLabel}>RDV</Text>
                    <Calendar color="#f59e0b" size={24} style={styles.statIcon} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mes Services</Text>

                <TouchableOpacity style={styles.listItem} onPress={() => handlePress('Commandes')}>
                    <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                        <Pill color="#16a34a" size={24} />
                    </View>
                    <View style={styles.listTextContainer}>
                        <Text style={styles.listTitle}>Mes Ordonnances</Text>
                        <Text style={styles.listSubtitle}>Gérer et renouveler vos prescriptions</Text>
                    </View>
                    <ChevronRight color="#94a3b8" size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.listItem} onPress={() => handlePress('RendezVous')}>
                    <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
                        <Calendar color="#d97706" size={24} />
                    </View>
                    <View style={styles.listTextContainer}>
                        <Text style={styles.listTitle}>Mes Rendez-vous</Text>
                        <Text style={styles.listSubtitle}>Consulter et planifier vos RDV médicaux</Text>
                    </View>
                    <ChevronRight color="#94a3b8" size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.listItem} onPress={() => handlePress('Chat')}>
                    <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                        <MessageSquare color="#16a34a" size={24} />
                    </View>
                    <View style={styles.listTextContainer}>
                        <Text style={styles.listTitle}>Messagerie Sécurisée</Text>
                        <Text style={styles.listSubtitle}>Échanger avec votre pharmacien</Text>
                    </View>
                    <ChevronRight color="#94a3b8" size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.listItem} onPress={() => handlePress('SuiviSante')}>
                    <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                        <Activity color="#dc2626" size={24} />
                    </View>
                    <View style={styles.listTextContainer}>
                        <Text style={styles.listTitle}>Suivi Santé</Text>
                        <Text style={styles.listSubtitle}>Historique de vos indicateurs</Text>
                    </View>
                    <ChevronRight color="#94a3b8" size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.listItem} onPress={() => handlePress('Profil')}>
                    <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                        <User color="#4f46e5" size={24} />
                    </View>
                    <View style={styles.listTextContainer}>
                        <Text style={styles.listTitle}>Mon Profil</Text>
                        <Text style={styles.listSubtitle}>Informations personnelles et sécurité</Text>
                    </View>
                    <ChevronRight color="#94a3b8" size={20} />
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    notificationIcon: {
        position: 'relative',
        padding: 8,
        backgroundColor: '#ecfdf5',
        borderRadius: 50,
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 8,
        width: 10,
        height: 10,
        backgroundColor: '#ef4444',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        position: 'relative',
        overflow: 'hidden',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 5,
    },
    statIcon: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        opacity: 0.2,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 15,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    listTextContainer: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    listSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
});
