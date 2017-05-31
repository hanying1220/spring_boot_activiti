package cdhl.springboot_activiti.web.rest.util;

import cdhl.springboot_activiti.domain.enums.MenuEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;

/**
 * Utility class for HTTP headers creation.
 */
public final class HeaderUtil {

    private static final Logger log = LoggerFactory.getLogger(HeaderUtil.class);

    private HeaderUtil(){
    }

    public static HttpHeaders createAlert(String message, String param) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-erpApp-alert", message);
        headers.add("X-erpApp-params", param);
        return headers;
    }

    public static HttpHeaders createEntityCreationAlert(String entityName, String param) {
        return createAlert("erpApp." + entityName + ".created", param);
    }

    public static HttpHeaders createEntityUpdateAlert(String entityName, String param) {
        return createAlert("erpApp." + entityName + ".updated", param);
    }

    public static HttpHeaders createEntityDeletionAlert(String entityName, String param) {
        return createAlert("erpApp." + entityName + ".deleted", param);
    }

    public static HttpHeaders createFailureAlert(String entityName, String errorKey, String defaultMessage) {
        log.error("Entity creation failed, {}", defaultMessage);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-erpApp-error", "error." + errorKey);
        headers.add("X-erpApp-params", entityName);
        return headers;
    }

    public static void main(String[] args) {
        String value= MenuEnum.Status.Add.value();
        String name=MenuEnum.Status.Add.text();
        System.out.println(value+" "+name);
        for (MenuEnum.Status e : MenuEnum.Status.values()) {
            System.out.println(e.value()+"/"+e.text());
        }
    }
}
