package cdhl.springboot_activiti.service.erm;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.Role;
import cdhl.springboot_activiti.repository.erm.RoleRepository;
import cdhl.springboot_activiti.service.ActivitiService;
import cdhl.springboot_activiti.service.ItenantService;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service
@Transactional
public class RoleService implements ItenantService {

    private final Logger log = LoggerFactory.getLogger(Role.class);

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private RoleService roleService;
    @Autowired
    private ActivitiService activitiService;

    public Role findOne(Long id){
        return roleRepository.findOne(id);
    }

    public List<Role> findAll(){
        return roleRepository.findAll();
    }

    public Role save(Role role){
        if(role.getId()!=null){
            Role roleOne=roleService.findOne(role.getId());
            roleOne.setName(role.getName());
            roleOne.setDescribe(role.getDescribe());
            return  roleRepository.save(roleOne);
        }
        else{
            role=roleRepository.save(role);
            addActivitiGroup(role);
            return role;
        }
    }

    public void deleteRole(Long id){
         roleRepository.delete(id);
         deleteActivitiGroup(id);
    }

    public List<Role> findAllByName(String name){
        return roleRepository.findAllByName(name);
    }

    public List<Role> findByNameLike(String name){
        if(name==null||"".equals(name)){
            return roleRepository.findAll();
        }
        else{
            return roleRepository.findByNameLike("%"+name+"%");
        }

    }

    private void addActivitiGroup(Role role){
        //activitiService.saveGroup(role,true);
    }
    private void deleteActivitiGroup(Long roleId){
        //activitiService.deleteRole(roleId.toString());
    }

}
