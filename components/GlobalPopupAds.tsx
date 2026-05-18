import PopupAd from '@/components/PopupAd';
import { listAds } from '@/lib/db/ads';

export default function GlobalPopupAds() {
  const popupAds = listAds({ activeOnly: true, placement: 'popup' });

  return <PopupAd ads={popupAds} />;
}
