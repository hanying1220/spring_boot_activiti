package cdhl.springboot_activiti.domain.enums;

import cdhl.springboot_activiti.config.annotation.Description;

/**
 * Created by Administrator on 2016/12/26.
 */
@Description(Name = "自定义枚举",Clazz=CustomEnum.Status.class)
public class   CustomEnum {
    public enum Status implements IEnumBean {
        PayWhy("PayWhy","支付方式",""),
        MenberLevel("MenberLevel","会员等级","");

        private final String value;
        private final String name;
        private final String param;
        Status(String value, String name,String param) {
            this.value = value;
            this.name = name;
            this.param = param;
        }
        public String value() {  return value;   }
        public String text() {   return name;    }
        public String param() {  return param; }
        public String toString() {   return value; }
    }
}
