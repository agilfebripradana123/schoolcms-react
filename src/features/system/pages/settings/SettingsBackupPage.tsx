import PageContainer from "@/components/layout/PageContainer";
import SettingsCategoryPage from "../../components/setting/SettingsCategoryPage";
import BackupHistorySection from "../../components/setting/BackupHistorySection";

export default function SettingsBackupPage() {
  return (
    <PageContainer className="py-6 space-y-6">
      <SettingsCategoryPage group="backup" noContainer />
      <BackupHistorySection />
    </PageContainer>
  );
}
