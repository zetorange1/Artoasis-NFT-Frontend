/* eslint-disable react-hooks/exhaustive-deps */
import { LoadingButton } from "@mui/lab";
import { Box, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUploader({ loading, title, onChange }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>();

  const onDrop = useCallback((acceptedFiles) => {
    const [file] = acceptedFiles;
    setFile(file);
    onChange(file);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/jpg, image/gif",
    noClick: true,
  });

  useEffect(() => {
    if (!file) {
      return;
    }
    const objUrl = URL.createObjectURL(file);
    setPreview(objUrl);
  }, [file]);

  return !file ? (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <LoadingButton
        onClick={open}
        variant="contained"
        color="bright"
        loading={loading}
        loadingIndicator={<CircularProgress color="secondary" size={18} />}
      >
        {title}
      </LoadingButton>
    </div>
  ) : (
    <Box py={2}>
      {preview && <img style={{ height: "300px" }} src={preview} alt="" />}
      {file && (
        <div>
          <LoadingButton
            variant="outlined"
            color="bright"
            size="large"
            loading={loading}
            onClick={() => {
              setPreview(null);
              setFile(null);
              onChange(null);
            }}
          >
            Cancel Image
          </LoadingButton>
        </div>
      )}
    </Box>
  );
}
