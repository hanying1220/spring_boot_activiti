package cdhl.springboot_activiti.service.util;

import com.qiniu.common.QiniuException;
import com.qiniu.http.Response;
import com.qiniu.storage.BucketManager;
import com.qiniu.storage.UploadManager;
import com.qiniu.util.Auth;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;

public class PicUtil {

	public static final String WX_MEDIA_PATH = "http://file.api.weixin.qq.com/cgi-bin/media/get";

	public static final String ACCESS_KEY = "";
	public static final String SECRET_KEY = "";

	public static final String[] BUCKET_COMMON ={"",""};

	public static final String[] BUCKET_COMMON_TEST ={"",""};

	public static Auth auth ;
	public static UploadManager uploadManager;
	public static BucketManager bucketManager;
	//= new BucketManager(auth);

	public static String getToken(String key){
		if(PicUtil.auth == null){
			PicUtil.auth = Auth.create(PicUtil.ACCESS_KEY, PicUtil.SECRET_KEY);
		}
		String upToken = PicUtil.auth.uploadToken(BUCKET_COMMON_TEST[0],key);
		return upToken;
	}

	/*
	 * ͬ��΢�ŷ�������ͼƬ����ţ�ƴ洢��
	 */
	public   static String wxToQiniu(String token,String mediaId,String[] bucket,String key){
		String url="error happend!";
		if(auth == null){
			auth = Auth.create(PicUtil.ACCESS_KEY, PicUtil.SECRET_KEY);
		}
	    if(bucketManager == null){
		    bucketManager = new BucketManager(auth);
	    }
		String wxUrl = WX_MEDIA_PATH+"?access_token="+token+"&media_id="+mediaId;
		 try {
			 bucketManager.fetch(wxUrl,bucket[0],key);
			 url = bucket[1]+key;
		} catch (QiniuException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return url;
	}

	public static String sendToQiniu(File file , String key,String[] bucket){
     	String ret ="false";
		if(PicUtil.auth == null){
			PicUtil.auth = Auth.create(PicUtil.ACCESS_KEY, PicUtil.SECRET_KEY);
		}
		String upToken = PicUtil.auth.uploadToken(bucket[0],key);
		if(PicUtil.uploadManager == null){
			PicUtil.uploadManager = new UploadManager();
		}

		try {

			Response res = PicUtil.uploadManager.put(file,key, upToken);
			System.out.println(res.bodyString());
			ret = res.bodyString();
//		     log.info(res);
//			 log.info(res.bodyString());
//			 Ret ret = res.jsonToObject(Ret.class);
		} catch (QiniuException e) {
			Response r = e.response;
			// ��Ӧ���ı���Ϣ
			System.out.println(e.getStackTrace());
		}
		return ret;
	}

	public static void delQiniuPic(String key,String[] bucket){
		if(auth == null){
			 auth = Auth.create(ACCESS_KEY, SECRET_KEY);
		}
	   if(bucketManager == null){
		   bucketManager = new BucketManager(auth);
	   }
		try {
			bucketManager.delete(bucket[0], key);
		} catch (QiniuException e) {
			// TODO Auto-generated catch block
			System.out.println(e.getMessage());
		}

	}
	public static String getRemoteUrl(String key,String[] bucket){
		return bucket[1]+"//"+key;
	}


	public static int[] getPicDem(File picture){
		  BufferedImage sourceImg;
		  int width = 0;
		  int heigth= 0;
		try {
			sourceImg = ImageIO.read(new FileInputStream(picture));
			 width = sourceImg.getWidth();
			 heigth = sourceImg.getHeight();
		} catch (Exception e) {
			  e.printStackTrace();
		}
		 return new int[]{width,heigth};
	}

	/**
	 * @param args
	 */
//	public static void main(String[] args) {
//		// TODO Auto-generated method stub
//		File file=new File("f:\\wyy.jpg");
//		String str=sendToQiniu(file,"123456789", PicUtil.BUCKET_COMMON_TEST);
//		System.out.println(str);
////		delQiniuPic("123456789", PicUtil.BUCKET_COMMON_TEST);
//	}

}
