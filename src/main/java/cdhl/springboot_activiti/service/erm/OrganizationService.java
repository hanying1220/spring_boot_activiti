package cdhl.springboot_activiti.service.erm;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.Organization;
import cdhl.springboot_activiti.repository.erm.OrganizationRepository;
import cdhl.springboot_activiti.service.ItenantService;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service
@Transactional
public class OrganizationService implements ItenantService {

    private final Logger log = LoggerFactory.getLogger(Organization.class);

    @Autowired
    private OrganizationRepository organizationRepository;

    public List<Organization> findAll(){
        return organizationRepository.findAll();
    }


    public List<Organization> findOrgzList(Long id){
        return organizationRepository.findAllByParentId(id);
    }

    public Organization save(Organization organization){
        if(organization.getId()!=null){
           Organization orgz= organizationRepository.findOne(organization.getId());
            orgz.setCls(organization.getCls());
            orgz.setCode(organization.getCode());
            orgz.setName(organization.getName());
            return organizationRepository.save(orgz);
        }else{
            return organizationRepository.save(organization);

        }

    }
    public void updateOrgz(String name,Long id){
        organizationRepository.updateOrgz(name,id);
    }

    public void deleteOrgz(Long id){
         organizationRepository.delete(id);
    }
}
