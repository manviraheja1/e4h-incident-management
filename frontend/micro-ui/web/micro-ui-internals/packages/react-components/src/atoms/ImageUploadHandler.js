import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "./Toast";
import UploadImages from "./UploadImages";

export const ImageUploadHandler = (props) => {
  // const __initImageIds = Digit.SessionStorage.get("PGR_CREATE_IMAGES");
  // const __initThumbnails = Digit.SessionStorage.get("PGR_CREATE_THUMBNAILS");
  const [image, setImage] = useState(null);
  
  const [uploadedImagesThumbs, setUploadedImagesThumbs] = useState(null);
  const [uploadedImagesIds, setUploadedImagesIds] = useState(props.uploadedImages);

  const [rerender, setRerender] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const allowedTypes=["image/jpeg", "image/png", "image/jpg"]
  useEffect(()=>{
    if(imageFile){
      console.log("image", imageFile)
      if(!allowedTypes.includes(imageFile.type)){
        setError(t("ONLY_IMAGES_ARE_ACCEPTED"));
        setImageFile(null);
      }
      else if (imageFile.size > 2097152) {
        setError("File is too large");
        setImageFile(null);
      }
      else {
        setImage(imageFile);
      }
    }
  }, [imageFile])  
  useEffect(() => {
    if (image) {
      uploadImage();
    }
  }, [image]);
  const clearError=useCallback(()=>{
    setError("");
  },[])
  useEffect(()=>{
    if(error){
      const timeOut=setTimeout(()=>{
        clearError();
      }, 1500);
      return ()=>clearTimeout(timeOut);
    }

  }, [error, clearError]);

  useEffect(() => {
    if (!isDeleting) {
      (async () => {
        if (uploadedImagesIds !== null) {
          await submit();
          setRerender(rerender + 1);
          props.onPhotoChange(uploadedImagesIds);
        }
      })();
    } else {
      setIsDeleting(false);
    }
  }, [uploadedImagesIds]);

  

  const addUploadedImageIds = useCallback(
    (imageIdData) => {
      if (uploadedImagesIds === null) {
        var arr = [];
      } else {
        arr = uploadedImagesIds;
      }
      return [...arr, imageIdData.data.files[0].fileStoreId];
    },
    [uploadedImagesIds]
  );

  function getImage(e) {
    
    setImageFile(e.target.files[0]);
    }
 

  const uploadImage = useCallback(async () => {
    try{
    const response = await Digit.UploadServices.Filestorage("property-upload", image, props.tenantId);
    if(response){
      setError("")
      setUploadedImagesIds(addUploadedImageIds(response));
    }else{
        setError("error uploading")
      }
    }catch(error){
      setError(t("CS_ACTION_UPLOAD_ERROR"))
    }
    
  }, [addUploadedImageIds, image]);

  function addImageThumbnails(thumbnailsData) {
    var keys = Object.keys(thumbnailsData.data);
    var index = keys.findIndex((key) => key === "fileStoreIds");
    if (index > -1) {
      keys.splice(index, 1);
    }
    var thumbnails = [];
    // if (uploadedImagesThumbs !== null) {
    //   thumbnails = uploadedImagesThumbs.length > 0 ? uploadedImagesThumbs.filter((thumb) => thumb.key !== keys[0]) : [];
    // }

    const newThumbnails = keys.map((key) => {
      return { image: thumbnailsData.data[key].split(",")[3], key };
    });

    setUploadedImagesThumbs([...thumbnails, ...newThumbnails]);
  }

  const submit = useCallback(async () => {
    if (uploadedImagesIds !== null && uploadedImagesIds.length > 0) {
      const res = await Digit.UploadServices.Filefetch(uploadedImagesIds, props.tenantId);
      addImageThumbnails(res);
    }
  }, [uploadedImagesIds]);

  function deleteImage(img) {
    setIsDeleting(true);
    var deleteImageKey = uploadedImagesThumbs.filter((o, index) => o.image === img);

    var uploadedthumbs = uploadedImagesThumbs;
    var newThumbsList = uploadedthumbs.filter((thumbs) => thumbs != deleteImageKey[0]);

    var newUploadedImagesIds = uploadedImagesIds.filter((key) => key !== deleteImageKey[0].key);
    setUploadedImagesThumbs(newThumbsList);
    setUploadedImagesIds(newUploadedImagesIds);
    Digit.SessionStorage.set("PGR_CREATE_IMAGES", newUploadedImagesIds);
  }

  return (
    <React.Fragment>
      {error && <Toast error={true} label={error} onClose={() => setError(null)} />}
      <UploadImages onUpload={getImage} onDelete={deleteImage} thumbnails={uploadedImagesThumbs ? uploadedImagesThumbs.map((o) => o.image) : []} />
    </React.Fragment>
  );
};
