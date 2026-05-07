import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, TextInput, Alert, Keyboard } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search } from 'lucide-react-native';
import { api } from '../../services/api'; // On suppose que ce helper API existe

const { width, height } = Dimensions.get('window');

interface Pharmacy {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_on_duty: boolean;
}

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg("Permission d'accès à la localisation refusée. Impossible d'afficher les pharmacies à proximité.");
                setLoading(false);
                return;
            }

            let currentLocation;
            try {
                currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
            } catch (error) {
                setErrorMsg("Impossible d'obtenir la localisation.");
                // On continue avec la localisation par défaut (Lomé)
            }

            try {
                const lat = currentLocation?.coords.latitude || 6.1372;
                const lng = currentLocation?.coords.longitude || 1.2255;

                const response = await api.get(`/search?q=&lat=${lat}&lng=${lng}&radius=10000`);

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des pharmacies");
                }
                const data = await response.json();

                if (Array.isArray(data)) {
                    const pharmacyMap = new Map<number, Pharmacy>();
                    data.forEach((p: any) => {
                        if (!pharmacyMap.has(p.pharmacy_id)) {
                            pharmacyMap.set(p.pharmacy_id, {
                                id: p.pharmacy_id, name: p.pharmacy_name, address: p.address,
                                latitude: p.lat, longitude: p.lng, is_on_duty: p.is_on_duty
                            });
                        }
                    });
                    const uniquePharmacies = Array.from(pharmacyMap.values());
                    setPharmacies(uniquePharmacies);
                }
            } catch (apiError: any) {
                setErrorMsg(apiError.message || "Erreur réseau. Impossible de charger les pharmacies.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSearch = async () => {
        Keyboard.dismiss();
        setIsSearching(true);
        // Ne pas afficher l'erreur plein écran pour les recherches, juste une alerte.
        // setErrorMsg(null); 
        try {
            const lat = location?.coords.latitude || 6.1372;
            const lng = location?.coords.longitude || 1.2255;

            const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}&lat=${lat}&lng=${lng}&radius=10000`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erreur lors de la recherche" }));
                throw new Error(errorData.message || "Erreur lors de la recherche des pharmacies");
            }
            const data = await response.json();

            if (Array.isArray(data)) {
                const pharmacyMap = new Map<number, Pharmacy>();
                data.forEach((p: any) => {
                    if (!pharmacyMap.has(p.pharmacy_id)) {
                        pharmacyMap.set(p.pharmacy_id, {
                            id: p.pharmacy_id, name: p.pharmacy_name, address: p.address,
                            latitude: p.lat, longitude: p.lng, is_on_duty: p.is_on_duty
                        });
                    }
                });
                const uniquePharmacies = Array.from(pharmacyMap.values());
                setPharmacies(uniquePharmacies);
                if (uniquePharmacies.length === 0 && searchQuery) {
                    Alert.alert("Aucun résultat", `Aucune pharmacie trouvée pour "${searchQuery}".`);
                }
            }
        } catch (apiError: any) {
            Alert.alert("Erreur de recherche", apiError.message || "Erreur réseau. Impossible de lancer la recherche.");
            // On ne vide pas les pharmacies pour que l'utilisateur garde la carte actuelle
        } finally {
            setIsSearching(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Recherche des pharmacies...</Text>
            </View>
        );
    }

    if (errorMsg && pharmacies.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    const initialRegion = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        // Lomé, Togo par défaut
        latitude: 6.136629,
        longitude: 1.222186,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une pharmacie, un médicament..."
                        placeholderTextColor="#a7f3d0" // emerald-200
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity onPress={handleSearch} style={styles.searchIcon} disabled={isSearching}>
                        {isSearching ? <ActivityIndicator color="#fff" size="small" /> : <Search color="#fff" size={22} />}
                    </TouchableOpacity>
                </View>
            </View>

            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {pharmacies.map((pharmacy) => (
                    <Marker
                        key={pharmacy.id}
                        coordinate={{ latitude: pharmacy.latitude, longitude: pharmacy.longitude }}
                    >
                        <MapPin color={pharmacy.is_on_duty ? '#ef4444' : '#10b981'} size={32} />
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                                <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                                {pharmacy.is_on_duty && (
                                    <View style={styles.gardeBadge}>
                                        <Text style={styles.gardeText}>DE GARDE</Text>
                                    </View>
                                )}
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>De garde</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.legendText}>Ouverte</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#333',
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#059669', // Emerald-700
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    searchIcon: {
        padding: 12,
    },
    map: {
        width: width,
        flex: 1,
    },
    callout: {
        backgroundColor: 'white',
        padding: 12,
        width: 200,
        borderRadius: 12,
        borderColor: '#e2e8f0',
        borderWidth: 1,
    },
    pharmacyName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        color: '#1e293b',
    },
    pharmacyAddress: {
        color: '#666',
        fontSize: 12,
    },
    gardeBadge: {
        backgroundColor: '#ef4444',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    gardeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },
    legendContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#333',
    },
});
