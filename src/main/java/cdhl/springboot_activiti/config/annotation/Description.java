package cdhl.springboot_activiti.config.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Description {
	public abstract String Name();
	public abstract String Group() default "";
	public abstract String Desc() default "";
	public abstract String Parent() default "parent";
	public abstract String Icon() default "";
    public abstract String Style() default "";
	public abstract String Format() default "";
    public abstract String Detail() default "";
    public abstract String Guide() default "";
	public abstract Class<?> Clazz() default Object.class;
	public abstract int Sort() default 0;
}
