package cdhl.springboot_activiti.web.rest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;

import cdhl.springboot_activiti.domain.enums.SystemEnum;
import cdhl.springboot_activiti.service.SystemEnumService;
import cdhl.springboot_activiti.web.rest.util.HeaderUtil;

/**
 * Created by Administrator on 2016/12/26.
 */
@RestController
@RequestMapping("/api/basic/enums")
public class SystemEnumResource {


    private final org.slf4j.Logger log = LoggerFactory.getLogger(SystemEnumResource.class);
    @Autowired
    private SystemEnumService systemEnumService;


    @RequestMapping(value = "/findAll",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<SystemEnum>> findSystemEnums() {
        List<SystemEnum> list = systemEnumService.findAll();
        return new ResponseEntity(list, HttpStatus.OK) ;
    }


    @RequestMapping(value = "/findByType",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<SystemEnum>> findSystemEnumsByType(String type) {
        List<SystemEnum> list = systemEnumService.findAllByType(type);
        return new ResponseEntity(list, HttpStatus.OK) ;
    }

    @RequestMapping(value = "/findByParent",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<SystemEnum>> findSystemEnumsByParent(String parent) {
        List<SystemEnum> list = systemEnumService.findAllByParent(parent);
        return new ResponseEntity(list, HttpStatus.OK) ;
    }

    @RequestMapping(value = "/findByClass",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<SystemEnum>> findSystemEnumsByClass() {
        List<SystemEnum> list = new ArrayList<>();
        List<SystemEnum> listSystem = systemEnumService.findAllByParent("system");
        list.addAll(listSystem);
        List<SystemEnum> listCustom = systemEnumService.findAllByParent("custom");
        list.addAll(listCustom);
        return new ResponseEntity(list, HttpStatus.OK) ;
    }


    @RequestMapping(value = "/create",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<SystemEnum> create(@RequestBody SystemEnum entity) throws URISyntaxException {

        if (entity.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("SystemEnum", "idexists", "A new menu cannot already have an ID")).body(null);
        }
        SystemEnum result = systemEnumService.save(entity);
        return ResponseEntity.created(new URI("/api/basic/create/" + entity.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("menu", entity.getId().toString()))
            .body(result);
    }


    @RequestMapping(value = "/update",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<SystemEnum> update(@RequestBody SystemEnum entity) throws URISyntaxException {
        if (entity.getId() == null) {
            return create(entity);
        }
        SystemEnum result = systemEnumService.save(entity);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("menu", entity.getId().toString()))
            .body(result);
    }


    @RequestMapping(value = "/delete",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> deleteMenu(Long id) {
        systemEnumService.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("dictionary", id.toString())).build();
    }
}
