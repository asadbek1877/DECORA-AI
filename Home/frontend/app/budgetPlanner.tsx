import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';

interface BudgetItem {
  id: string;
  name: string;
  category: 'material' | 'labor' | 'income' | 'expense';
  amount: number;
  date: string;
}

export default function BudgetPlannerScreen() {
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'material' | 'labor' | 'income' | 'expense'>('expense');

  const totalIncome = items
    .filter(item => item.category === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalExpense = items
    .filter(item => item.category === 'expense' || item.category === 'material' || item.category === 'labor')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleAddItem = () => {
    if (newItemName && newItemAmount) {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        name: newItemName,
        category: selectedCategory,
        amount: parseFloat(newItemAmount),
        date: new Date().toLocaleDateString(),
      };
      setItems([newItem, ...items]);
      setNewItemName('');
      setNewItemAmount('');
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'income':
        return '#10b981';
      case 'material':
        return '#f59e0b';
      case 'labor':
        return '#8b5cf6';
      default:
        return '#ef4444';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'income':
        return 'arrow-down';
      case 'material':
        return 'cube';
      case 'labor':
        return 'people';
      default:
        return 'arrow-up';
    }
  };

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title="Budget Planner" showBack />

      <ScreenWrapper>
        <ScrollView 
          contentContainerStyle={s.scroll} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STATS CARDS */}
          <FadeInView delay={0}>
            <View style={s.statsGrid}>
              <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.statLabel, { color: colors.muted }]}>Income</Text>
                <Text style={[s.statAmount, { color: '#10b981' }]}>
                  {totalIncome.toLocaleString()}
                </Text>
              </View>
              <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.statLabel, { color: colors.muted }]}>Expenses</Text>
                <Text style={[s.statAmount, { color: '#ef4444' }]}>
                  {totalExpense.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={[s.balanceCard, { backgroundColor: colors.primary }]}>
              <Text style={s.balanceLabel}>Balance</Text>
              <Text style={[s.balanceAmount, { color: balance >= 0 ? '#10b981' : '#ef4444' }]}>
                {balance.toLocaleString()}
              </Text>
            </View>
          </FadeInView>

          {/* ADD ITEM SECTION */}
          <FadeInView delay={100}>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.cardTitle, { color: colors.text }]}>Add Item</Text>

              <TextInput
                style={[s.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Item name"
                placeholderTextColor={colors.muted}
                value={newItemName}
                onChangeText={setNewItemName}
              />

              <TextInput
                style={[s.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Amount"
                placeholderTextColor={colors.muted}
                value={newItemAmount}
                onChangeText={setNewItemAmount}
                keyboardType="decimal-pad"
              />

              <View style={s.categoryButtons}>
                {(['income', 'expense', 'material', 'labor'] as const).map(cat => (
                  <Pressable
                    key={cat}
                    style={[
                      s.categoryBtn,
                      selectedCategory === cat && { backgroundColor: getCategoryColor(cat) }
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[
                      s.categoryBtnText,
                      selectedCategory === cat && { color: '#fff', fontWeight: '700' }
                    ]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <AnimatedPressable
                style={[s.addBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddItem}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={s.addBtnText}>Add Item</Text>
              </AnimatedPressable>
            </View>
          </FadeInView>

          {/* ITEMS LIST */}
          <FadeInView delay={200}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Transaction History</Text>
            <View style={{ gap: 10 }}>
              {items.map(item => (
                <View
                  key={item.id}
                  style={[s.itemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[s.itemIcon, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                    <Ionicons name={getCategoryIcon(item.category) as any} size={16} color={getCategoryColor(item.category)} />
                  </View>
                  <View style={s.itemContent}>
                    <Text style={[s.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[s.itemDate, { color: colors.muted }]}>{item.date}</Text>
                  </View>
                  <Text style={[s.itemAmount, { color: item.category === 'income' ? '#10b981' : '#ef4444' }]}>
                    {item.category === 'income' ? '+' : '-'}{item.amount}
                  </Text>
                  <Pressable onPress={() => handleDeleteItem(item.id)}>
                    <Ionicons name="trash" size={18} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          </FadeInView>

          <View style={{ height: 60 }} />
        </ScrollView>
      </ScreenWrapper>

      <BottomNav active="home" />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40, gap: 20 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  statLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  statAmount: { fontSize: 22, fontWeight: '800' },
  balanceCard: { borderRadius: 20, padding: 20, gap: 8, alignItems: 'center' },
  balanceLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  balanceAmount: { fontSize: 32, fontWeight: '900' },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  categoryButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryBtn: { flex: 1, minWidth: '45%', borderRadius: 10, paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  categoryBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  addBtn: { flexDirection: 'row', borderRadius: 12, paddingVertical: 14, gap: 8, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  itemIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemDate: { fontSize: 11, fontWeight: '500' },
  itemAmount: { fontSize: 14, fontWeight: '800' },
});
