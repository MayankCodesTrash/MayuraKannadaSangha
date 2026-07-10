const BASE_URL =
  'https://storage.googleapis.com/production-websitebuilder-v1-0-7/287/1991287/3q88gokE';

const IMAGE_IDS = [
  '620ce222bc944ebaa8a3025d8ae9b677',
  'c80f64b6d498439ebaefbf31f90b08ae',
  'effff291977047238ca9e685d5ad7496',
  '4311f8dcf0884cb4bca435abaf0fe647',
  '26f7c88924684b248b5ef45a114e8e9d',
  '48c991132705425184523800edc765ab',
  '23f5a6d9e78f4ad9b49fdccc14039a18',
  '93e21d3753b440c0a00079e348696717',
  'c4627533c40443ff96310a464ae2a6f6',
  '9359767fe2474666a1f6262d30d90189',
  'ba373a5f5c3642eeba1340adad8c9b32',
  '0dd917ce26074d47aeb7fb6572df5c62',
  'd9153a3c45a6426abb02267f81b3a025',
  '38aa2f9db3b748ab9324da70e4242094',
  '9aec304fb0814c2fa8e28e2b6aa6acb3',
];

export const GALLERY_IMAGES = IMAGE_IDS.map((id) => `${BASE_URL}/${id}`);
