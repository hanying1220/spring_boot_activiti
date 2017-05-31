package cdhl.springboot_activiti.domain.enums;

import cdhl.springboot_activiti.config.annotation.Description;

/**
 * Created by Administrator on 2016/12/23.
 */
@Description(Name = "菜单动作",Clazz=MenuEnum.Status.class)
public class   MenuEnum  extends SystemEnum {
    public enum Status implements IEnumBean {
        Add("Add","新增",""),
        Edit("Edit","编辑",""),
        Delete("Delete","删除",""),
        Submit("Submit","提交",""),
        Audit("Audit","审核",""),
        Invalid("Invalid","作废",""),
//        Save("Save","保存","","iconfont icon-baocun"),
//        Cancel("Cancel","取消","","iconfont icon-quxiao"),
//        Receipt("Receipt","收款","",""),
//        Back("Back","退款","",""),
//        PAY("PAY","付款","",""),
//        ReturnOrder("ReturnOrder","退订","",""),
//        Stop("Stop","终止","",""),
//        Unwrap("Unwrap","解绑","",""),
//        NoShelves("NoShelves","下架","",""),
//        Shelves("Shelves","上架","",""),
//        Disable("Disable","停用","",""),
//        Enable("Enable","启用","",""),
//        YesPush("YesPush","发布","",""),
//        Download("Download","下载","","" ),
//        Upload("Upload","上传","",""),
//        Import("Import","导入","","" ),
//        Export("Export","导出","",""),
//        Preview("Preview","预览","",""),
//        Verify("Verify","确认","" ,""),
//        UnVerify("UnVerify","反确认","",""),
//        ConvertMaxOrder("ConvertMaxOrder","转大定","",""),
//        Init("Init","初始化","","")，
//        Delivery("Delivery","转出库","",""),
//        NoAudit("UnAudit","审核不通过","",""),
//        CancelAduit("CancelAduit","取消审核","",""),
//        Contract("Contract","生成合同","",""),
//        MaxOrder("MaxOrder","生成大定","",""),
//        MinOrder("MinOrder","生成小订","",""),
//        NoPush("NoPush","取消发布","","");
        View("View","查看","");


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
