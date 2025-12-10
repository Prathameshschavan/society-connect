import { uploadFile } from "../../apis/upload.apis";

const useUploadApiService = () => {

  const handleUploadFile = async (file: File, organization_id: string) => {
    try {
      const response = await uploadFile(file, organization_id);
      console.log(response);
      return response?.data?.data;
    } catch (error: any) {
      console.log(error);
      throw Error(error.response.data.message);
    }
  };

  return {
    handleUploadFile,
  };
};

export default useUploadApiService;
