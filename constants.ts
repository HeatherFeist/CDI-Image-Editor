import { AppMode } from './types';

export const APP_MODES = [
  {
    id: AppMode.RENOVATION,
    label: 'Home Renovation',
    description: 'Visualize upgrades and sync estimates directly to your Renovision Pro Project Bucket.',
    icon: 'Home'
  },
  {
    id: AppMode.MARKETPLACE,
    label: 'Marketplace Studio',
    description: 'Create professional staging and send assets directly to your CDI Marketplace Listing Bucket.',
    icon: 'ShoppingBag'
  },
  {
    id: AppMode.MERCHANT_COIN,
    label: 'Merchant Coin Studio',
    description: 'Design premium visuals and sync branding assets to your Quantum Wallet.',
    icon: 'Coins'
  },
  {
    id: AppMode.GENERAL,
    label: 'Creative Edit',
    description: 'General purpose AI image editing and transformation.',
    icon: 'Wand'
  }
];

export const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/600';