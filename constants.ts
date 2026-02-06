
import { Product, StoreSettings } from './types';

export const COLORS = {
  brown: '#3d251e',
  orange: '#f68c3e',
  cream: '#fff5e1',
  text: '#1f2937'
};

export const INITIAL_SETTINGS: StoreSettings = {
  isDeliveryActive: true,
  isTableOrderActive: true,
  isCounterPickupActive: true,
  storeName: 'Vovó Guta',
  logoUrl: 'https://images.tcdn.com.br/img/img_prod/1126742/1665494238_logo_vovo_guta_2.jpg',
  primaryColor: '#3d251e',
  secondaryColor: '#f68c3e',
  canWaitstaffFinishOrder: false,
  canWaitstaffCancelItems: false,
  thermalPrinterWidth: '80mm'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pão de Queijo Especial',
    description: 'Receita caseira com muito queijo canastra.',
    price: 4.50,
    category: 'Padaria',
    imageUrl: 'https://picsum.photos/seed/pao/400/300',
    isActive: true,
    featuredDay: 1
  },
  {
    id: '2',
    name: 'Bolo de Cenoura com Chocolate',
    description: 'Fofinho com calda crocante de chocolate belga.',
    price: 12.00,
    category: 'Confeitaria',
    imageUrl: 'https://picsum.photos/seed/bolo/400/300',
    isActive: true,
    featuredDay: 2
  },
  {
    id: '3',
    name: 'Café Coado na Hora',
    description: 'Grãos selecionados torra média.',
    price: 5.00,
    category: 'Bebidas',
    imageUrl: 'https://picsum.photos/seed/cafe/400/300',
    isActive: true,
    featuredDay: 3
  }
];
