package cdhl.springboot_activiti.web.rest;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;

import cdhl.springboot_activiti.domain.erm.PersistentAuditEvent;
import cdhl.springboot_activiti.repository.erm.PersistenceAuditEventRepository;

/**
 * Created by Administrator on 2016/12/29.
 */
@RestController
@RequestMapping("/api/log")
public class AccesslogResource {

    private final org.slf4j.Logger log = LoggerFactory.getLogger(AccesslogResource.class);
    @Autowired
    private PersistenceAuditEventRepository persistenceAuditEventRepository;
    @RequestMapping(value = "/findAllAccess",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Page<PersistentAuditEvent>>findAllAccess( Pageable pageable) {
       Sort sort = new Sort(Sort.Direction.DESC, "auditEventDate");
       pageable=new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Page<PersistentAuditEvent> list = persistenceAuditEventRepository.findAll(pageable);
        return new ResponseEntity(list, HttpStatus.OK) ;
    }


}
