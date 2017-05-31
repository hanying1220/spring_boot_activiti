package cdhl.springboot_activiti.web.rest.erm;

import com.codahale.metrics.annotation.Timed;
import cdhl.springboot_activiti.service.util.PicUtil;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;

/**
 * 上传管理
 */
@RestController
@RequestMapping("/api")
public class UploadResource {
    /**
     * 上传文件
     */
    public List<File> file;

    private final Logger log = LoggerFactory.getLogger(UploadResource.class);

    @RequestMapping(value = "/upload",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Map<String,Object>>> upload() throws Exception {
        log.debug("REST request to save Menu : {}");

        List<Map<String,Object>> list=new ArrayList<>();
        if(!file.isEmpty()){
            System.out.println("file size :"+file.size());
            for (int i = 0; i < file.size(); i++) {
                File f=file.get(i);
                String key= UUID.randomUUID().toString();
                String fileType = FilenameUtils.getExtension(f.getName());
                PicUtil.sendToQiniu(f, key + "." + fileType, PicUtil.BUCKET_COMMON_TEST);
                Map<String,Object> map=new HashMap<>();
                map.put("fileUrl",PicUtil.BUCKET_COMMON_TEST[1] + key+"."+fileType);
                list.add(map);
            }
        }
        return ResponseEntity.ok().body(list);
    }

    @RequestMapping(value = "/upload2",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Object> upload2(@RequestParam("file") MultipartFile file) throws Exception {
        log.debug("REST request to save Menu : {}");
        Map<String,Object> map=new HashMap<>();

        if(file.isEmpty()){
            map.put("success",false);
            map.put("message","上传图片为空");
            return ResponseEntity.ok(map);
        }

        System.out.println(file.getOriginalFilename()+"\t"+file.getContentType()+"\t"+file.getSize());

        String originalName = file.getOriginalFilename();
        String uploadName = UUID.randomUUID().toString()+"."+FilenameUtils.getExtension(originalName);
        String tempPath = System.getProperty("java.io.tmpdir") + "/"+uploadName;
        File tempFile = new File(tempPath);
        file.transferTo(tempFile);
        tempFile.deleteOnExit();

        PicUtil.sendToQiniu(tempFile, uploadName, PicUtil.BUCKET_COMMON_TEST);
        map.put("success",true);
        map.put("fileName",originalName);
        map.put("url", PicUtil.BUCKET_COMMON_TEST[1]+uploadName);

        return ResponseEntity.ok(map);
    }

    public List<File> getFile() {
        return file;
    }

    public void setFile(List<File> file) {
        this.file = file;
    }
}
