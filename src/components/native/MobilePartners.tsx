import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../../i18n';
import en from '../../i18n/locales/en';
import hi from '../../i18n/locales/hi';
import mr from '../../i18n/locales/mr';
import or from '../../i18n/locales/or';

interface MobilePartnersProps {
  language?: string;
}

const { width } = Dimensions.get('window');

const certifiedPartners = [
  {
    id: 1,
    name: 'Spice Garden Restaurant',
    category: 'Restaurant',
    rating: 4.8,
    verified: true,
    healthScore: 92,
    address: 'Mumbai, Maharashtra',
    speciality: 'Traditional Indian Cuisine',
    certificationId: 'SWTH-MH-2024-0847',
    certifiedSince: 'March 2024',
    phone: '+91 22 2654 8976',
    timing: '11:00 AM - 11:00 PM',
    lowOilDishes: [
      { name: 'Steamed Idli Sambar', calories: 180, oilUsed: '2ml', oilType: 'Sesame Oil', tags: ['Low Fat', 'High Fiber'] },
      { name: 'Tandoori Roti', calories: 120, oilUsed: '0ml', oilType: 'None', tags: ['No Oil', 'Whole Grain'] },
      { name: 'Dal Tadka (Lite)', calories: 220, oilUsed: '5ml', oilType: 'Rice Bran Oil', tags: ['Protein Rich', 'Low Oil'] },
      { name: 'Grilled Paneer Tikka', calories: 195, oilUsed: '4ml', oilType: 'Mustard Oil', tags: ['High Protein', 'Low Fat'] },
      { name: 'Mixed Vegetable Raita', calories: 85, oilUsed: '0ml', oilType: 'None', tags: ['Probiotic', 'No Oil'] },
    ]
  },
  {
    id: 2,
    name: 'Green Leaf Cafe',
    category: 'Cafe',
    rating: 4.6,
    verified: true,
    healthScore: 88,
    address: 'Pune, Maharashtra',
    speciality: 'Healthy Fast Food',
    certificationId: 'SWTH-MH-2024-1023',
    certifiedSince: 'May 2024',
    phone: '+91 20 4567 8901',
    timing: '8:00 AM - 10:00 PM',
    lowOilDishes: [
      { name: 'Quinoa Salad Bowl', calories: 165, oilUsed: '3ml', oilType: 'Olive Oil', tags: ['Superfood', 'Low Cal'] },
      { name: 'Grilled Chicken Wrap', calories: 280, oilUsed: '5ml', oilType: 'Sunflower Oil', tags: ['High Protein', 'Low Fat'] },
      { name: 'Steamed Momos', calories: 190, oilUsed: '2ml', oilType: 'Sesame Oil', tags: ['Steamed', 'Low Oil'] },
      { name: 'Fresh Fruit Smoothie', calories: 120, oilUsed: '0ml', oilType: 'None', tags: ['No Oil', 'Vitamin Rich'] },
    ]
  },
  {
    id: 3,
    name: 'Ocean View Bistro',
    category: 'Restaurant',
    rating: 4.7,
    verified: true,
    healthScore: 90,
    address: 'Goa',
    speciality: 'Seafood & Continental',
    certificationId: 'SWTH-GA-2024-0156',
    certifiedSince: 'January 2024',
    phone: '+91 832 245 6789',
    timing: '12:00 PM - 11:30 PM',
    lowOilDishes: [
      { name: 'Grilled Fish Fillet', calories: 210, oilUsed: '4ml', oilType: 'Olive Oil', tags: ['Omega-3', 'Low Fat'] },
      { name: 'Steamed Prawns', calories: 145, oilUsed: '2ml', oilType: 'Butter (Clarified)', tags: ['High Protein', 'Steamed'] },
      { name: 'Garden Fresh Salad', calories: 95, oilUsed: '3ml', oilType: 'Extra Virgin Olive Oil', tags: ['Raw', 'Fiber Rich'] },
      { name: 'Baked Vegetables', calories: 130, oilUsed: '3ml', oilType: 'Olive Oil', tags: ['Baked', 'Low Oil'] },
    ]
  },
  {
    id: 4,
    name: 'Masala Kitchen',
    category: 'Restaurant',
    rating: 4.5,
    verified: true,
    healthScore: 86,
    address: 'Delhi NCR',
    speciality: 'North Indian Cuisine',
    certificationId: 'SWTH-DL-2024-0492',
    certifiedSince: 'April 2024',
    phone: '+91 11 4567 8901',
    timing: '11:30 AM - 10:30 PM',
    lowOilDishes: [
      { name: 'Roti & Dal Fry', calories: 250, oilUsed: '5ml', oilType: 'Ghee', tags: ['Balanced', 'Traditional'] },
      { name: 'Tandoori Chicken', calories: 230, oilUsed: '4ml', oilType: 'Mustard Oil', tags: ['High Protein', 'Grilled'] },
      { name: 'Jeera Rice', calories: 180, oilUsed: '3ml', oilType: 'Ghee', tags: ['Light', 'Low Oil'] },
      { name: 'Baingan Bharta (Lite)', calories: 165, oilUsed: '5ml', oilType: 'Mustard Oil', tags: ['Smoky', 'Low Fat'] },
    ]
  },
  {
    id: 5,
    name: 'Fresh Bites',
    category: 'Cafe',
    rating: 4.4,
    verified: true,
    healthScore: 84,
    address: 'Bangalore, Karnataka',
    speciality: 'Quick Bites & Beverages',
    certificationId: 'SWTH-KA-2024-0678',
    certifiedSince: 'June 2024',
    phone: '+91 80 2345 6789',
    timing: '7:00 AM - 9:00 PM',
    lowOilDishes: [
      { name: 'Oats Upma', calories: 150, oilUsed: '3ml', oilType: 'Coconut Oil', tags: ['Fiber Rich', 'Low Oil'] },
      { name: 'Sprouts Chaat', calories: 120, oilUsed: '2ml', oilType: 'Groundnut Oil', tags: ['Raw', 'Protein'] },
      { name: 'Multigrain Sandwich', calories: 210, oilUsed: '4ml', oilType: 'Olive Oil', tags: ['Whole Grain', 'Balanced'] },
      { name: 'Green Detox Juice', calories: 80, oilUsed: '0ml', oilType: 'None', tags: ['No Oil', 'Detox'] },
    ]
  },
  {
    id: 6,
    name: 'Royal Tandoor',
    category: 'Restaurant',
    rating: 4.9,
    verified: true,
    healthScore: 94,
    address: 'Hyderabad, Telangana',
    speciality: 'Mughlai & Tandoori',
    certificationId: 'SWTH-TS-2024-0234',
    certifiedSince: 'February 2024',
    phone: '+91 40 6789 0123',
    timing: '12:00 PM - 11:00 PM',
    lowOilDishes: [
      { name: 'Tandoori Platter', calories: 320, oilUsed: '5ml', oilType: 'Mustard Oil', tags: ['Grilled', 'High Protein'] },
      { name: 'Roomali Roti', calories: 90, oilUsed: '1ml', oilType: 'Ghee', tags: ['Ultra Low Oil', 'Light'] },
      { name: 'Seekh Kebab', calories: 185, oilUsed: '3ml', oilType: 'Refined Oil', tags: ['Grilled', 'Lean Meat'] },
      { name: 'Mint Raita', calories: 65, oilUsed: '0ml', oilType: 'None', tags: ['No Oil', 'Cooling'] },
      { name: 'Chicken Tikka', calories: 195, oilUsed: '4ml', oilType: 'Mustard Oil', tags: ['High Protein', 'Low Fat'] },
    ]
  }
];

const oilProducts = [
  {
    id: 1,
    name: 'Fortune Rice Bran Oil',
    price: 155,
    unit: 'L',
    gst: '5%',
    tfa: '<2%',
    badges: ['Fortified', 'Healthy Choice'],
    availability: 'Available via PDS in Maharashtra',
    points: 5,
    featured: true
  },
  {
    id: 2,
    name: 'Sundrop Heart Lite',
    price: 142,
    unit: 'L',
    gst: '12%',
    tfa: '<2%',
    badges: ['Fortified'],
    availability: 'Available in most regions',
    points: 4,
    featured: false
  },
  {
    id: 3,
    name: 'Saffola Gold Pro Healthy Lifestyle',
    price: 168,
    unit: 'L',
    gst: '5%',
    tfa: '<1%',
    badges: ['Fortified', 'Healthy Choice', 'Low TFA'],
    availability: 'Premium stores nationwide',
    points: 8,
    featured: true
  },
  {
    id: 4,
    name: 'Dhara Groundnut Oil',
    price: 135,
    unit: 'L',
    gst: '18%',
    tfa: '<3%',
    badges: ['Traditional'],
    availability: 'Available via PDS in Tamil Nadu',
    points: 3,
    featured: false
  },
  {
    id: 5,
    name: 'Oleev Active Olive Oil',
    price: 285,
    unit: 'L',
    gst: '5%',
    tfa: '<1%',
    badges: ['Fortified', 'Healthy Choice', 'Premium'],
    availability: 'Premium outlets',
    points: 12,
    featured: true
  },
  {
    id: 6,
    name: 'Gemini Sunflower Oil',
    price: 128,
    unit: 'L',
    gst: '12%',
    tfa: '<2%',
    badges: ['Fortified'],
    availability: 'Available in South India',
    points: 4,
    featured: false
  }
];

export function MobilePartners({ language = 'en' }: MobilePartnersProps) {
  const navigation = useNavigation<any>();
  
  // Get translations based on current language
  const locales: Record<string, typeof en> = { en, hi, mr, or };
  const t = locales[language] || en;
  
  const [selectedTab, setSelectedTab] = useState('certified');
  const [productSearch, setProductSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [selectedGST, setSelectedGST] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [showFortified, setShowFortified] = useState(false);
  const [compareProducts, setCompareProducts] = useState<number[]>([]);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof certifiedPartners[0] | null>(null);

  const handleRestaurantPress = (partner: typeof certifiedPartners[0]) => {
    setSelectedRestaurant(partner);
    setShowRestaurantModal(true);
  };
  const [showCompareModal, setShowCompareModal] = useState(false);



  const filteredPartners = certifiedPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                          partner.category.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                          partner.speciality.toLowerCase().includes(restaurantSearch.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => b.healthScore - a.healthScore);

  const filteredProducts = oilProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesGST = !selectedGST || product.gst === selectedGST;
    const matchesFortified = !showFortified || product.badges.includes('Fortified');
    return matchesSearch && matchesGST && matchesFortified;
  }).sort((a, b) => {
    if (selectedSort === 'popular') return b.points - a.points;
    if (selectedSort === 'price-low') return a.price - b.price;
    if (selectedSort === 'price-high') return b.price - a.price;
    return 0;
  });

  const toggleCompare = (id: number) => {
    if (compareProducts.includes(id)) {
      setCompareProducts(compareProducts.filter(pid => pid !== id));
    } else if (compareProducts.length < 3) {
      setCompareProducts([...compareProducts, id]);
    }
  };

  const handleCompare = () => {
    if (compareProducts.length >= 2) {
      setShowCompareModal(true);
    }
  };

  const clearComparison = () => {
    setCompareProducts([]);
    setShowCompareModal(false);
  };

  const getComparedProducts = () => {
    return oilProducts.filter(p => compareProducts.includes(p.id));
  };

  const handleScan = () => {
    console.log('Open camera for product scanning');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.iconContainer}>
              <Ionicons name="storefront" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>{t.partners.partnersTitle}</Text>
              <Text style={styles.headerSubtitle}>{t.partners.partnersSubtitle}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'certified' && styles.tabActive]}
              onPress={() => setSelectedTab('certified')}
            >
              <Text style={[styles.tabText, selectedTab === 'certified' && styles.tabTextActive]}>
                {t.partners.certifiedTab}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'products' && styles.tabActive]}
              onPress={() => setSelectedTab('products')}
            >
              <Text style={[styles.tabText, selectedTab === 'products' && styles.tabTextActive]}>
                {t.partners.productsTab}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {selectedTab === 'certified' ? (
            // Certified Partners Tab
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#5B5B5B" style={styles.searchIcon} />
                <TextInput
                  placeholder={t.partners.restaurantSearchPlaceholder}
                  value={restaurantSearch}
                  onChangeText={setRestaurantSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#5B5B5B"
                />
              </View>

              {/* Certified Partners List */}
              <View style={styles.partnersList}>
                {filteredPartners.map((partner) => (
                  <TouchableOpacity 
                    key={partner.id} 
                    style={styles.partnerCard}
                    onPress={() => handleRestaurantPress(partner)}
                  >
                    <View style={styles.partnerCardHeader}>
                      <View style={styles.partnerIconContainer}>
                        <Ionicons name="restaurant" size={28} color="#1b4a5a" />
                      </View>
                      <View style={styles.partnerCardInfo}>
                        <View style={styles.partnerNameRow}>
                          <Text style={styles.partnerName}>{partner.name}</Text>
                          {partner.verified && (
                            <Ionicons name="checkmark-circle" size={20} color="#07A996" />
                          )}
                        </View>
                        <Text style={styles.partnerCategory}>{partner.category} • {partner.speciality}</Text>
                        <Text style={styles.partnerAddress}>
                          <Ionicons name="location" size={12} color="#5B5B5B" /> {partner.address}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.partnerCardFooter}>
                      <View style={styles.partnerStat}>
                        <Ionicons name="star" size={16} color="#fcaf56" />
                        <Text style={styles.partnerStatText}>{partner.rating}</Text>
                      </View>
                      <View style={styles.partnerHealthScore}>
                        <Text style={styles.healthScoreLabel}>{t.partners.healthScore}: </Text>
                        <Text style={styles.healthScoreValue}>{partner.healthScore}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            // Swasth Oil Products Tab
            <>
          {/* Scan Product Section */}
          <View style={styles.scanSection}>
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
              <Ionicons name="camera" size={20} color="#1b4a5a" />
              <Text style={styles.scanButtonText}>{t.partners.scanProduct}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.manualButton}>
              <Text style={styles.manualButtonText}>{t.partners.enterManual}</Text>
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{t.partners.scanInfo}</Text>
              <TouchableOpacity>
                <Text style={styles.infoLink}>{t.partners.howWorks}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#5B5B5B" style={styles.searchIcon} />
            <TextInput
              placeholder={t.partners.searchPlaceholder}
              value={productSearch}
              onChangeText={setProductSearch}
              style={styles.searchInput}
              placeholderTextColor="#5B5B5B"
            />
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[styles.chip, selectedGST === '5%' && styles.chipActive]}
                onPress={() => setSelectedGST(selectedGST === '5%' ? null : '5%')}
              >
                <Text style={[styles.chipText, selectedGST === '5%' && styles.chipTextActive]}>GST 5%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedGST === '12%' && styles.chipActive]}
                onPress={() => setSelectedGST(selectedGST === '12%' ? null : '12%')}
              >
                <Text style={[styles.chipText, selectedGST === '12%' && styles.chipTextActive]}>GST 12%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedGST === '18%' && styles.chipActive]}
                onPress={() => setSelectedGST(selectedGST === '18%' ? null : '18%')}
              >
                <Text style={[styles.chipText, selectedGST === '18%' && styles.chipTextActive]}>GST 18%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, showFortified && styles.chipActive]}
                onPress={() => setShowFortified(!showFortified)}
              >
                <Text style={[styles.chipText, showFortified && styles.chipTextActive]}>{t.partners.fortified}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Sort Dropdown */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>{t.partners.sort}</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>
                {selectedSort === 'popular' ? t.partners.popular : selectedSort === 'price-low' ? t.partners.priceLow : t.partners.priceHigh}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#5B5B5B" />
            </TouchableOpacity>
          </View>

          {/* Compare Products Button */}
          {compareProducts.length > 0 && (
            <TouchableOpacity 
              style={[styles.compareButton, compareProducts.length < 2 && styles.compareButtonDisabled]}
              onPress={handleCompare}
              disabled={compareProducts.length < 2}
            >
              <Ionicons name="git-compare" size={20} color="#ffffff" />
              <Text style={styles.compareButtonText}>
                {compareProducts.length < 2 ? t.partners.selectProducts : `${t.partners.compare} (${compareProducts.length})`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Product Listings */}
          <View style={styles.productList}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productRow}>
                  {/* Product Image Placeholder */}
                  <View style={styles.productImage}>
                    <View style={styles.productImageInner}>
                      <View style={styles.productImageCircle} />
                    </View>
                  </View>

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                      <View style={styles.productTitleRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>₹{product.price}/{product.unit}</Text>
                        {product.featured && (
                          <Ionicons name="trophy" size={16} color="#fcaf56" />
                        )}
                      </View>
                    </View>

                    {/* Badges */}
                    <View style={styles.badges}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>GST {product.gst}</Text>
                      </View>
                      {product.badges.includes('Fortified') && (
                        <View style={[styles.badge, styles.badgeFortified]}>
                          <Text style={styles.badgeTextFortified}>{t.partners.fortified}</Text>
                        </View>
                      )}
                      <View style={[styles.badge, styles.badgeTFA]}>
                        <Text style={styles.badgeTextTFA}>TFA {product.tfa}</Text>
                      </View>
                      {product.badges.includes('Healthy Choice') && (
                        <View style={[styles.badge, styles.badgeHealthy]}>
                          <Text style={styles.badgeTextHealthy}>{t.partners.healthyChoice}</Text>
                        </View>
                      )}
                    </View>

                    {/* Availability */}
                    {product.availability && (
                      <View style={styles.availabilityRow}>
                        <Ionicons name="location" size={14} color="#3b82f6" />
                        <Text style={styles.availabilityText}>{product.availability}</Text>
                      </View>
                    )}

                    {/* Points */}
                    <View style={styles.pointsRow}>
                      <Ionicons name="star" size={14} color="#fcaf56" />
                      <Text style={styles.pointsText}>+{product.points} {t.partners.pts}</Text>
                    </View>

                    {/* Compare Checkbox */}
                    <TouchableOpacity
                      style={styles.compareCheckbox}
                      onPress={() => toggleCompare(product.id)}
                      disabled={!compareProducts.includes(product.id) && compareProducts.length >= 3}
                    >
                      <View style={[styles.checkbox, compareProducts.includes(product.id) && styles.checkboxActive]}>
                        {compareProducts.includes(product.id) && (
                          <Ionicons name="checkmark" size={14} color="#ffffff" />
                        )}
                      </View>
                      <Text style={styles.compareText}>{t.partners.addToCompare}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Info Section */}
          <View style={styles.aboutSection}>
            <View style={styles.aboutHeader}>
              <Ionicons name="information-circle" size={20} color="#1b4a5a" />
              <Text style={styles.aboutTitle}>{t.partners.aboutTitle}</Text>
            </View>
            <Text style={styles.aboutText}>{t.partners.aboutText1}</Text>
            <Text style={styles.aboutText}>{t.partners.aboutText2}</Text>
          </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Restaurant Detail Modal */}
      <Modal
        visible={showRestaurantModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRestaurantModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="restaurant" size={24} color="#ffffff" />
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedRestaurant?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowRestaurantModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedRestaurant && (
              <>
                {/* Certification Banner */}
                <View style={styles.certificationBanner}>
                  <View style={styles.certBadge}>
                    <Ionicons name="shield-checkmark" size={32} color="#07A996" />
                  </View>
                  <View style={styles.certInfo}>
                    <Text style={styles.certTitle}>Swasthyam Certified</Text>
                    <Text style={styles.certId}>ID: {selectedRestaurant.certificationId}</Text>
                    <Text style={styles.certSince}>Since {selectedRestaurant.certifiedSince}</Text>
                  </View>
                  <View style={styles.healthBadge}>
                    <Text style={styles.healthBadgeScore}>{selectedRestaurant.healthScore}</Text>
                    <Text style={styles.healthBadgeLabel}>Health Score</Text>
                  </View>
                </View>

                {/* Restaurant Details */}
                <View style={styles.restaurantDetails}>
                  <Text style={styles.sectionTitle}>Restaurant Details</Text>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="restaurant-outline" size={20} color="#1b4a5a" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{selectedRestaurant.category} • {selectedRestaurant.speciality}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={20} color="#1b4a5a" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue}>{selectedRestaurant.address}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={20} color="#1b4a5a" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>{selectedRestaurant.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={20} color="#1b4a5a" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Timing</Text>
                      <Text style={styles.detailValue}>{selectedRestaurant.timing}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="star" size={20} color="#fcaf56" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Rating</Text>
                      <Text style={styles.detailValue}>{selectedRestaurant.rating} / 5.0</Text>
                    </View>
                  </View>
                </View>

                {/* Low Oil Dishes Section */}
                <View style={styles.lowOilSection}>
                  <View style={styles.lowOilHeader}>
                    <View style={styles.lowOilTitleRow}>
                      <Ionicons name="leaf" size={22} color="#16a34a" />
                      <Text style={styles.lowOilTitle}>Low Oil Dishes</Text>
                    </View>
                    <View style={styles.lowOilBadge}>
                      <Text style={styles.lowOilBadgeText}>{selectedRestaurant.lowOilDishes.length} items</Text>
                    </View>
                  </View>
                  <Text style={styles.lowOilSubtitle}>Healthy options with minimal oil usage</Text>

                  {selectedRestaurant.lowOilDishes.map((dish, index) => (
                    <View key={index} style={styles.dishCard}>
                      <View style={styles.dishHeader}>
                        <Text style={styles.dishName}>{dish.name}</Text>
                        <View style={styles.dishOilBadge}>
                          <Ionicons name="water" size={12} color="#1b4a5a" />
                          <Text style={styles.dishOilText}>{dish.oilUsed}</Text>
                        </View>
                      </View>
                      <View style={styles.dishDetails}>
                        <View style={styles.dishCalories}>
                          <Ionicons name="flame-outline" size={14} color="#f59e0b" />
                          <Text style={styles.dishCaloriesText}>{dish.calories} cal</Text>
                        </View>
                        {dish.oilType && dish.oilType !== 'None' && (
                          <View style={styles.oilTypeBadge}>
                            <Ionicons name="leaf-outline" size={12} color="#059669" />
                            <Text style={styles.oilTypeText}>{dish.oilType}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.dishTags}>
                        {dish.tags.map((tag, tagIndex) => (
                          <View 
                            key={tagIndex} 
                            style={[
                              styles.dishTag,
                              tag.includes('No Oil') && styles.dishTagGreen,
                              tag.includes('Low') && styles.dishTagBlue,
                              tag.includes('High Protein') && styles.dishTagOrange,
                            ]}
                          >
                            <Text style={[
                              styles.dishTagText,
                              tag.includes('No Oil') && styles.dishTagTextGreen,
                              tag.includes('Low') && styles.dishTagTextBlue,
                              tag.includes('High Protein') && styles.dishTagTextOrange,
                            ]}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Certification Info */}
                <View style={styles.certInfoSection}>
                  <View style={styles.certInfoHeader}>
                    <Ionicons name="information-circle" size={20} color="#1b4a5a" />
                    <Text style={styles.certInfoTitle}>About Swasthyam Certification</Text>
                  </View>
                  <Text style={styles.certInfoText}>
                    Swasthyam Certified restaurants meet strict guidelines for oil usage, 
                    offering dishes with reduced oil content while maintaining authentic taste. 
                    All certified partners are regularly audited to ensure compliance.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={20} color="#1b4a5a" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionsButton}>
              <Ionicons name="navigate" size={20} color="#ffffff" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comparison Modal */}
      <Modal
        visible={showCompareModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCompareModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="git-compare" size={24} color="#ffffff" />
                <Text style={styles.modalTitle}>{t.partners.compareProducts}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCompareModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Comparison Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Product Names Header */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Text style={styles.labelText}>Product</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <Text style={styles.productHeaderName} numberOfLines={2}>{product.name}</Text>
                    <TouchableOpacity 
                      onPress={() => toggleCompare(product.id)}
                      style={styles.removeProductBtn}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Price Comparison */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Ionicons name="cash-outline" size={18} color="#1b4a5a" />
                <Text style={styles.labelText}>{t.partners.price}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <Text style={styles.valueText}>₹{product.price}/{product.unit}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* GST Rate Comparison */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Ionicons name="document-text-outline" size={18} color="#1b4a5a" />
                <Text style={styles.labelText}>{t.partners.gstRate}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{product.gst}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Trans Fat Comparison */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Ionicons name="water-outline" size={18} color="#1b4a5a" />
                <Text style={styles.labelText}>{t.partners.transFat}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <View style={[styles.badge, styles.badgeTFA]}>
                      <Text style={styles.badgeTextTFA}>{product.tfa}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Benefits/Badges Comparison */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#1b4a5a" />
                <Text style={styles.labelText}>{t.partners.benefits}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <View style={styles.badgesList}>
                      {product.badges.map((badge, idx) => (
                        <View 
                          key={idx} 
                          style={[
                            styles.comparisonBadge,
                            badge === 'Fortified' && styles.badgeFortified,
                            badge === 'Healthy Choice' && styles.badgeHealthy,
                          ]}
                        >
                          <Text 
                            style={[
                              styles.comparisonBadgeText,
                              badge === 'Fortified' && styles.badgeTextFortified,
                              badge === 'Healthy Choice' && styles.badgeTextHealthy,
                            ]}
                          >
                            {badge}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Availability Comparison */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Ionicons name="location-outline" size={18} color="#1b4a5a" />
                <Text style={styles.labelText}>{t.partners.availability}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <Text style={styles.smallText} numberOfLines={3}>{product.availability}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Reward Points Comparison */}
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabel}>
                <Ionicons name="star-outline" size={18} color="#1b4a5a" />
                <Text style={styles.labelText}>{t.partners.rewardPoints}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {getComparedProducts().map((product, index) => (
                  <View key={product.id} style={[styles.productColumn, index === 0 && styles.firstColumn]}>
                    <View style={styles.pointsBadge}>
                      <Ionicons name="star" size={16} color="#fcaf56" />
                      <Text style={styles.pointsValue}>+{product.points}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearComparison}>
              <Text style={styles.clearButtonText}>{t.partners.clearAll}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowCompareModal(false)}>
              <Text style={styles.doneButtonText}>{t.partners.closeComparison}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#1b4a5a',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1b4a5a',
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  scanSection: {
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1b4a5a',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  manualButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  manualButtonText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  infoBox: {
    backgroundColor: '#ffeedd',
    borderWidth: 1,
    borderColor: '#fcaf56',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#040707',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoLink: {
    fontSize: 14,
    color: '#1b4a5a',
    textDecorationLine: 'underline',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#040707',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  chipText: {
    fontSize: 14,
    color: '#040707',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sortText: {
    fontSize: 14,
    color: '#040707',
  },
  compareButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  compareButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  compareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  productList: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageInner: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageCircle: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  productHeader: {
    gap: 4,
  },
  productTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#16a34a',
  },
  badgeFortified: {
    backgroundColor: '#dbeafe',
  },
  badgeTextFortified: {
    fontSize: 12,
    color: '#2563eb',
  },
  badgeTFA: {
    backgroundColor: '#ccfbf1',
  },
  badgeTextTFA: {
    fontSize: 12,
    color: '#0d9488',
  },
  badgeHealthy: {
    backgroundColor: '#ffeedd',
  },
  badgeTextHealthy: {
    fontSize: 12,
    color: '#1b4a5a',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityText: {
    flex: 1,
    fontSize: 12,
    color: '#3b82f6',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    color: '#fcaf56',
  },
  compareCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  compareText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  aboutSection: {
    backgroundColor: '#fafbfa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  aboutText: {
    fontSize: 14,
    color: '#5B5B5B',
    lineHeight: 20,
    marginBottom: 8,
  },
  partnersList: {
    gap: 16,
  },
  partnerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerCardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  partnerIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#E7F2F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerCardInfo: {
    flex: 1,
    gap: 4,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    flex: 1,
  },
  partnerCategory: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  partnerAddress: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  partnerCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  partnerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerStatText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#040707',
  },
  partnerHealthScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreLabel: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  healthScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#07A996',
  },
  // Comparison Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minHeight: 80,
  },
  comparisonLabel: {
    width: 120,
    padding: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#040707',
  },
  productsScroll: {
    flex: 1,
  },
  productColumn: {
    width: 140,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  firstColumn: {
    borderLeftWidth: 0,
  },
  productHeaderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    textAlign: 'center',
    marginBottom: 8,
  },
  removeProductBtn: {
    marginTop: 4,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1b4a5a',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
    color: '#5B5B5B',
    textAlign: 'center',
    lineHeight: 18,
  },
  badgesList: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
  },
  comparisonBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  comparisonBadgeText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '500',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Restaurant Detail Modal Styles
  certificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  certBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certInfo: {
    flex: 1,
    marginLeft: 12,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  certId: {
    fontSize: 13,
    color: '#15803d',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  certSince: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 2,
  },
  healthBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  healthBadgeScore: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  healthBadgeLabel: {
    fontSize: 9,
    color: '#dcfce7',
    textTransform: 'uppercase',
  },
  restaurantDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#040707',
    marginTop: 2,
  },
  lowOilSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lowOilHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lowOilTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lowOilTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
  },
  lowOilBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowOilBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  lowOilSubtitle: {
    fontSize: 13,
    color: '#5B5B5B',
    marginBottom: 16,
  },
  dishCard: {
    backgroundColor: '#fafbfa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#040707',
    flex: 1,
  },
  dishOilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dishOilText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  dishDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishCalories: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dishCaloriesText: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  oilTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  oilTypeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  dishTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  dishTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dishTagGreen: {
    backgroundColor: '#dcfce7',
  },
  dishTagBlue: {
    backgroundColor: '#dbeafe',
  },
  dishTagOrange: {
    backgroundColor: '#fef3c7',
  },
  dishTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#5B5B5B',
  },
  dishTagTextGreen: {
    color: '#16a34a',
  },
  dishTagTextBlue: {
    color: '#3b82f6',
  },
  dishTagTextOrange: {
    color: '#f59e0b',
  },
  certInfoSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  certInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  certInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  certInfoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E7F2F1',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1b4a5a',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    paddingVertical: 14,
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
