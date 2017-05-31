package cdhl.springboot_activiti.service.erm;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.RoleUser;
import cdhl.springboot_activiti.repository.erm.RoleUserRepository;
import cdhl.springboot_activiti.service.ActivitiService;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service
@Transactional
public class RoleUserService {

    private final Logger log = LoggerFactory.getLogger(RoleUser.class);

    @Autowired
    private RoleUserRepository roleUserRepository;
    @Autowired
    private ActivitiService activitiService;

    public List<RoleUser> findByRoleId(Long roleId) {
        return roleUserRepository.findByRoleId(roleId);
    }

    public List<RoleUser>findUserByRoleId(Long userId,Long roleId){
        return roleUserRepository.findAllByUserIdAndRoleId(userId, roleId);
    }

    public RoleUser save(RoleUser roleUser) {
        roleUser=roleUserRepository.save(roleUser);
        addActivitiMemberShip(roleUser);
       return roleUser;
    }

    public void delete(RoleUser roleUser) {
        roleUserRepository.delete(roleUser);
        deleteActivitiMemberShip(roleUser.getUser().getId().toString(), roleUser.getRole().getId().toString());
    }

    public void deleteById(Long id) {
        RoleUser roleUser=roleUserRepository.findOne(id);
        roleUserRepository.deleteById(id);
        if (roleUser!=null){
            deleteActivitiMemberShip(roleUser.getUser().getId().toString(), roleUser.getRole().getId().toString());
        }
    }


    public List<RoleUser> findByNameLike(String name,Long roleId) {
        if(name==null||"".equals(name)){
            return roleUserRepository.findByRoleId(roleId);
        }
        else{
            return roleUserRepository.findByNameLikeAndRoleId(name, roleId);
        }

    }

    private void addActivitiMemberShip(RoleUser roleUser){
        //activitiService.saveMemberShip(roleUser,true);
    }
    private void deleteActivitiMemberShip(String userId,String roleId){
        //activitiService.deleteMemberShip(userId,roleId);
    }
}
