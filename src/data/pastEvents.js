const CDN_BASE = 'https://mayurakannadasangha.org/s/cdn/v1.0/i/m?url=';
const RESIZE_SUFFIX = '&methods=resize%2C900%2C5000';

function cdnImage(encodedSourceUrl) {
  return `${CDN_BASE}${encodedSourceUrl}${RESIZE_SUFFIX}`;
}

export const PAST_EVENTS = [
  {
    id: 'clay-ganesha-2025-08',
    date: 'August 23, 2025',
    title: 'Clay Ganesha Workshop',
    location: 'Urbandale Library, IA',
    image: cdnImage(
      'https%3A%2F%2Fstorage.googleapis.com%2Fproduction-websitebuilder-v1-0-7%2F287%2F1991287%2F3q88gokE%2Fed65ca41c7324b2cb90be7af887aa8e5'
    ),
  },
  {
    id: 'summer-picnic-2025',
    date: 'August 9, 2025',
    title: 'Summer Picnic',
    location: 'Cottonwood Recreational Area, Polk City, IA',
    image: cdnImage(
      'https%3A%2F%2Fstorage.googleapis.com%2Fproduction-websitebuilder-v1-0-7%2F287%2F1991287%2F3q88gokE%2F4a262624b41247e7ad6f6a5e8a2c9749'
    ),
  },
  {
    id: 'india-day-2025',
    date: 'August 2, 2025',
    title: '2025 India Day',
    location: 'Living History Farms, Clive, IA',
    image: cdnImage(
      'https%3A%2F%2Fstorage.googleapis.com%2Fproduction-websitebuilder-v1-0-7%2F287%2F1991287%2F3q88gokE%2Ff85f2adeec664f2ba607026d9424007f'
    ),
  },
  {
    id: 'dasara-2024',
    date: 'September 28, 2024',
    title: 'Dasara Mahotsava',
    location: 'Franklin Junior High School, Des Moines, IA',
    image: cdnImage(
      'https%3A%2F%2Fstorage.googleapis.com%2Fproduction-websitebuilder-v1-0-7%2F287%2F1991287%2F3q88gokE%2F85e9fb33a9c24dd593ec293f32377a81'
    ),
  },
  {
    id: 'clay-ganesha-2024-09',
    date: 'September 1, 2024',
    title: 'Clay Ganesha Workshop',
    location: 'Terra Park- 6300 Pioneer Pkwy Johnston, IA 50131',
    image: cdnImage(
      'https%3A%2F%2Fstorage.googleapis.com%2Fproduction-websitebuilder-v1-0-7%2F287%2F1991287%2F3q88gokE%2Fd656692a81c1472ab6791d1606c64a34'
    ),
  },
];
