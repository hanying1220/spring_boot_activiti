package cdhl.springboot_activiti.interceptor;

import ognl.OgnlRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component
public class FileUploadInterceptor extends HandlerInterceptorAdapter {

    private final static Logger LOG = LoggerFactory.getLogger(FileUploadInterceptor.class);

    private List<String> tempList;

    public FileUploadInterceptor(){}

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)  throws Exception {
        HandlerMethod handlerMethod = (HandlerMethod)handler;
        Object bean = handlerMethod.getBean();
        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver(request.getSession().getServletContext());
        if (multipartResolver.isMultipart(request)) {
            tempList = new ArrayList<String>();
            MultipartHttpServletRequest multiRequest = (MultipartHttpServletRequest) request;
            Iterator<String> iter = multiRequest.getFileNames();
            while (iter.hasNext()) {
                String fileKeyName=iter.next();
                List<MultipartFile> files=multiRequest.getFiles(fileKeyName);
                if(files!=null){
                    List<File> listFile=new ArrayList<>();
                    String fieldName=null;
                    for (MultipartFile file : files){
                        if (file != null) {
                            fieldName = file.getName();
                            String originalName = file.getOriginalFilename();
                            String tempPath = System.getProperty("java.io.tmpdir") + "/"+originalName;
                            File tempFile = new File(tempPath);
                            file.transferTo(tempFile);
                            listFile.add(tempFile);
                            tempList.add(tempPath);
                        }
                    }
                    PropertyDescriptor pd = OgnlRuntime.getPropertyDescriptor(bean.getClass(), fieldName);
                    if(pd != null){
                        Method method = pd.getWriteMethod();
                        method.invoke(bean,(Object)listFile);
                    }
                    else{
                        for (File f:listFile){
                            f.delete();
                        }
                    }
                }
            }
        }
        else{
            if(tempList != null) {
                tempList.clear();
                tempList = null;
            }
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        //System.out.println("ds");

        if(tempList != null){
            for(String tempPath : tempList) {
                File tempFile = new File(tempPath);
                if (tempFile.exists()) {
                    tempFile.delete();
                }
            }
            tempList.clear();
            tempList = null;
        }
    }
}
