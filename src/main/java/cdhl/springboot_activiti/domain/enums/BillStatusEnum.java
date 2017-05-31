package cdhl.springboot_activiti.domain.enums;

import cdhl.springboot_activiti.config.annotation.Description;

/**
 * Created by Administrator on 2017/1/6.
 */
@Description(Name = "单据状态",Clazz=BillStatusEnum.Status.class)
public class BillStatusEnum extends SystemEnum{
    public enum Status implements IEnumBean {

        Pending("bill_pending","待审","");

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
