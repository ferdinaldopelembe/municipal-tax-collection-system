package mz.beira.cobranca.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_settings")
public class AppSetting {
    @Id
    private String settingKey;
    @Lob
    private String settingValue;

    protected AppSetting() {}

    public AppSetting(String settingKey, String settingValue) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
    }

    public String getSettingKey() { return settingKey; }
    public String getSettingValue() { return settingValue; }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }
}
