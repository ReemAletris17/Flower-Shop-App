import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export default function AddProduct({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'Please allow access to your photo library.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'Please allow access to your camera.');
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function uploadImage(imageAsset) {
    const fileName = `product_${Date.now()}.jpg`;
    const blob = await (await fetch(imageAsset.uri)).blob();
    const arrayBuffer = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsArrayBuffer(blob); });
    const { error } = await supabase.storage.from('product-images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
  }

  async function handleSubmit() {
    if (!name || !price || !category) return Alert.alert('Missing fields', 'Please fill in name, price and category.');
    try {
      setUploading(true);
      const image_url = image ? await uploadImage(image) : null;
      const { error } = await supabase.from('products').insert({ name, description, price: parseFloat(price), category, stock: parseInt(stock) || 10, image_url });
      if (error) throw error;
      Alert.alert('Success', 'Product added successfully!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setUploading(false);
    }
  }
  

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <Text style={styles.title}>Add Product</Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Red Rose Bouquet" placeholderTextColor="#bbb" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 72, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Optional" placeholderTextColor="#bbb" multiline />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Price (EGP) *</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor="#bbb" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Stock</Text>
          <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="10" placeholderTextColor="#bbb" keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>Category *</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Flowers" placeholderTextColor="#bbb" />

      <Text style={styles.label}>Image</Text>
      {image
        ? <TouchableOpacity onPress={pickImage}><Image source={{ uri: image.uri }} style={styles.preview} /><Text style={styles.change}>Change photo</Text></TouchableOpacity>
        : <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.imgBtn} onPress={pickImage}><Text style={styles.imgBtnText}>Library</Text></TouchableOpacity>
            <TouchableOpacity style={styles.imgBtn} onPress={takePhoto}><Text style={styles.imgBtnText}>Camera</Text></TouchableOpacity>
          </View>
      }

      <TouchableOpacity style={[styles.submit, uploading && { backgroundColor: '#ccc' }]} onPress={handleSubmit} disabled={uploading} activeOpacity={0.8}>
        {uploading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitText}>Add Product</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '500', color: '#999', marginTop: 14, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 15, color: '#111' },
  preview: { width: '100%', height: 180, borderRadius: 8, backgroundColor: '#eee' },
  change: { fontSize: 12, color: '#999', marginTop: 6, textDecorationLine: 'underline' },
  imgBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center', backgroundColor: '#f5f5f5' },
  imgBtnText: { fontSize: 14, fontWeight: '500', color: '#444' },
  submit: { backgroundColor: '#111', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});