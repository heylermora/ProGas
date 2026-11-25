import SponsorForm from 'views/admin/sponsor/form';
import { PublicPage } from './PublicPage';

export default function PromotionForm() {
  return <PublicPage maxW="1000px"><SponsorForm publicSubmission /></PublicPage>;
}
