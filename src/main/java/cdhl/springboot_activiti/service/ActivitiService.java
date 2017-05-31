package cdhl.springboot_activiti.service;

import java.util.List;

import org.activiti.engine.IdentityService;
import org.activiti.engine.identity.Group;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.Role;
import cdhl.springboot_activiti.domain.erm.RoleUser;
import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.repository.erm.RoleRepository;
import cdhl.springboot_activiti.repository.erm.RoleUserRepository;
import cdhl.springboot_activiti.repository.erm.UserRepository;

/**
 * Created by Administrator on 2016/12/23.
 */
@Service
@Transactional
public class ActivitiService {

    private final Logger log = LoggerFactory.getLogger(ActivitiService.class);

    @Autowired
    private IdentityService identityService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private RoleUserRepository roleUserRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;


    /**
     * 清空工作流用户、角色以及关系
     */
    public void deleteAllActivitiIdentifyData() throws Exception {
        log.info("start delete all activiti identify data.");
        String sql_user = "delete from ACT_ID_USER";
        String sql_group = "delete from ACT_ID_GROUP";
        String sql_membership = "delete from ACT_ID_MEMBERSHIP";
        jdbcTemplate.execute(sql_user);
        jdbcTemplate.execute(sql_group);
        jdbcTemplate.execute(sql_membership);
        log.info("delete all activiti identify data completed.");
    }


    /**
     * 同步activiti用户权限数据
     */
    public void syncActivitiData(){
        log.info(">>>>>>>>>开始同步数据...");
        long actUserCount=identityService.createUserQuery().count();
        if (actUserCount==0){
            List<User> lstUser=userRepository.findAll();
            List<Role> lstRole=roleRepository.findAll();
            List<RoleUser> lstRoleUser=roleUserRepository.findAll();
            log.info("用户数量："+lstUser.size()+",角色数量："+lstRole.size()+",用户角色数量："+lstRoleUser.size());
            for (User bean : lstUser){
                saveUser(bean,false);
                log.info("用户数据同步完成。");
            }
            for (Role bean : lstRole){
                saveGroup(bean,false);
                log.info("角色数据同步完成。");
            }
            for (RoleUser bean : lstRoleUser){
                saveMemberShip(bean,false);
                log.info("用户角色数据同步完成。");
            }
        }

    }

    /**
     * 保存流程用户
     * @param bean
     * @param isCheck
     */
    public void saveUser(User bean,boolean isCheck){
        if(isCheck){
            long count=identityService.createUserQuery().userId(bean.getId().toString()).count();
            if (count>0){
                return;
            }
        }

        org.activiti.engine.identity.User user=identityService.newUser(bean.getId().toString());
        user.setFirstName(bean.getName());
        user.setEmail(bean.getEmail());
        identityService.saveUser(user);
    }
    /**
     * 保存流程角色
     * @param bean
     * @param isCheck
     */
    public void saveGroup(Role bean,boolean isCheck){
        if(isCheck){
            long count=identityService.createGroupQuery().groupId(bean.getId().toString()).count();
            if (count > 0) {
                return;
            }
        }

        org.activiti.engine.identity.Group group=identityService.newGroup(bean.getId().toString());
        group.setName(bean.getName());
        group.setType("assignment");
        identityService.saveGroup(group);
    }

    /**
     * 保存流程用户角色关系
     * @param bean
     * @param isCheck
     */
    public void saveMemberShip(RoleUser bean,boolean isCheck){
        if(isCheck){

        }
        identityService.createMembership(bean.getUser().getId().toString(), bean.getRole().getId().toString());
    }

    public void saveMemberShip(User user,List<Role> roles,boolean isClearRole){
        if(isClearRole){
            List<Group> groups=identityService.createGroupQuery().groupMember(user.getId().toString()).list();
            for (Group group : groups){
                identityService.deleteMembership(user.getId().toString(),group.getId());
            }
        }
        for (Role role : roles){
            identityService.createMembership(user.getId().toString(), role.getId().toString());
        }
    }

    /**
     * 删除流程用户
     */
    public void deleteUser(String userId){
        identityService.deleteUser(userId);
    }
    /**
     * 删除流程角色
     */
    public void deleteRole(String roleId){
        identityService.deleteGroup(roleId);
    }
    /**
     * 删除流程用户角色关系
     */
    public void deleteMemberShip(String userId,String roleId){
        identityService.deleteMembership(userId,roleId);
    }
}
