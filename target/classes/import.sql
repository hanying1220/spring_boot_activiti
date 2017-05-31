drop table act_id_user;
drop table act_id_group;
drop table act_id_membership;

CREATE or REPLACE VIEW act_id_user(ID_,REV_,FIRST_,LAST_,EMAIL_,PWD_,PICTURE_ID_) AS
  SELECT
    TO_CHAR(au.id) AS ID_,
    0          AS REV_,
    to_char(au.name)   AS FIRST_,
    '' AS LAST_,
    to_char(au.email)      AS EMAIL_,
    to_char(au.password)   AS PWD_,
    au.user_url          AS PICTURE_ID_
  FROM T_ERM_USER au;


CREATE or REPLACE VIEW act_id_group
AS
  SELECT ar.id AS ID_,
         NULL AS REV_,
         ar.name AS NAME_,
         'assignment' AS TYPE_
  FROM T_ERM_ROLE ar;


CREATE or REPLACE VIEW act_id_membership
AS
   SELECT ur.USER_ID AS USER_ID_,
       ur.role_ID AS GROUP_ID_
   FROM T_ERM_ROLE_USER ur;
