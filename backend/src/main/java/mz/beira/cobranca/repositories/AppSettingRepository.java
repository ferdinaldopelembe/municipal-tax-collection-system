package mz.beira.cobranca.repositories;

import mz.beira.cobranca.models.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {}
