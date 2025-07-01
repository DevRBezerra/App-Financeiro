import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, Alert, Modal } from 'react-native';
import { categoriesService } from '../services/categories';
import { Ionicons } from 'react-native-vector-icons';

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#007AFF');
  const [icon, setIcon] = useState('💡');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await require('../services/supabase').authService.getCurrentUser();
      if (!user) return;
      setUserId(user.id);
      const cats = await categoriesService.getCategories(user.id);
      setCategories(cats);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cat = null) => {
    setEditCategory(cat);
    setName(cat ? cat.name : '');
    setType(cat ? cat.type : 'expense');
    setColor(cat ? cat.color : '#007AFF');
    setIcon(cat ? cat.icon : '💡');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    try {
      if (editCategory) {
        // Editar
        const updated = await categoriesService.updateCategory(editCategory.id, { name, type, color, icon });
        setCategories(categories.map(cat => cat.id === updated.id ? updated : cat));
      } else {
        // Criar
        const newCat = await categoriesService.createCategory({ user_id: userId, name, type, color, icon, created_at: new Date().toISOString() });
        setCategories([...categories, newCat]);
      }
      setShowModal(false);
      setEditCategory(null);
      setName('');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          await categoriesService.deleteCategory(id);
          setCategories(categories.filter(cat => cat.id !== id));
        } catch (error) {
          Alert.alert('Erro', 'Erro ao excluir categoria');
        } finally {
          setLoading(false);
        }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Categorias</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Ionicons name="add-circle" size={28} color="#007AFF" />
        <Text style={styles.addButtonText}>Nova Categoria</Text>
      </TouchableOpacity>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: item.color || '#007AFF' }] }>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryType}>{item.type === 'income' ? 'Receita' : 'Despesa'}</Text>
            </View>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.editButton}>
              <Ionicons name="create-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash" size={22} color="#FF5A5F" />
            </TouchableOpacity>
          </View>
        )}
        style={{ marginTop: 16 }}
      />
      {/* Modal de criar/editar categoria */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editCategory ? 'Editar Categoria' : 'Nova Categoria'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da categoria"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeButton, type === 'expense' && styles.selectedType]} onPress={() => setType('expense')}>
                <Text style={[styles.typeText, type === 'expense' && styles.selectedTypeText]}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeButton, type === 'income' && styles.selectedType]} onPress={() => setType('income')}>
                <Text style={[styles.typeText, type === 'income' && styles.selectedTypeText]}>Receita</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ícone (emoji)"
              value={icon}
              onChangeText={setIcon}
              maxLength={2}
            />
            <TextInput
              style={styles.input}
              placeholder="Cor (hex)"
              value={color}
              onChangeText={setColor}
              maxLength={7}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 8 },
  categoryIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 20 },
  categoryName: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  categoryType: { fontSize: 12, color: '#666' },
  editButton: { marginLeft: 8 },
  deleteButton: { marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },
  input: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 8, width: '100%' },
  typeRow: { flexDirection: 'row', marginVertical: 8 },
  typeButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#EEE', marginHorizontal: 4, alignItems: 'center' },
  selectedType: { backgroundColor: '#007AFF' },
  typeText: { color: '#007AFF', fontWeight: 'bold' },
  selectedTypeText: { color: '#FFF' },
  saveButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16, width: '100%' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 12 },
  cancelButtonText: { color: '#007AFF', fontWeight: 'bold' },
});

export default CategoriesScreen; 