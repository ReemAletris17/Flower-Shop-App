import * as Linking from 'expo-linking';

export function createProductLink(productId) {
  return Linking.createURL(`product/${productId}`);
}

export function useLinkHandler(navigation) {
  const handleUrl = ({ url }) => {
    const { path } = Linking.parse(url);
    if (path && path.startsWith('product/')) {
      const productId = path.replace('product/', '');
      navigation.navigate('ProductDetail', { productId });
    }
  };

  return handleUrl;
}