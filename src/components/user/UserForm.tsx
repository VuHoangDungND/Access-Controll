import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { User } from '../../types';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string | null, userData: any) => void;
  user: User | null;
  isEditing: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isEditing,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    idNumber: '',
    faceImage: '',
    fingerPrint: '',
  });

  const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null);
  const [fingerPrintPreview, setFingerPrintPreview] = useState<string | null>(null);
  
  const faceImageInputRef = useRef<HTMLInputElement>(null);
  const fingerPrintInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(user);
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        idNumber: user.idNumber || '',
        faceImage: user.faceImage || '',
        fingerPrint: user.fingerPrint || '',
      });
      
      // Set previews if user data exists
      if (user.faceImage) setFaceImagePreview(user.faceImage);
      if (user.fingerPrint) setFingerPrintPreview(user.fingerPrint);
    } else {
      setFormData({
        username: '',
        name: '',
        idNumber: '',
        faceImage: '',
        fingerPrint: '',
      });
      setFaceImagePreview(null);
      setFingerPrintPreview(null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (type: 'faceImage' | 'fingerPrint') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'faceImage') {
        setFormData(prev => ({ ...prev, faceImage: result }));
        setFaceImagePreview(result);
      } else {
        setFormData(prev => ({ ...prev, fingerPrint: result }));
        setFingerPrintPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = (type: 'faceImage' | 'fingerPrint') => {
    if (type === 'faceImage' && faceImageInputRef.current) {
      faceImageInputRef.current.click();
    } else if (type === 'fingerPrint' && fingerPrintInputRef.current) {
      fingerPrintInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && user) {
      onSubmit(user.id, formData);
    } else {
      onSubmit(null, formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Stack>
            <TextField
              fullWidth
              label="ID Number"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              required
            />
            
            {/* Image uploads */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Face Image */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ảnh khuôn mặt
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  p: 2
                }}>
                  <input
                    ref={faceImageInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="face-image-upload"
                    type="file"
                    onChange={handleFileUpload('faceImage')}
                  />
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    {faceImagePreview ? (
                      <Avatar 
                        src={faceImagePreview} 
                        alt="Ảnh khuôn mặt"
                        sx={{ width: 150, height: 150, mb: 1 }}
                      />
                    ) : (
                      <Avatar 
                        sx={{ width: 150, height: 150, mb: 1, bgcolor: 'grey.300' }}
                      >
                        <PhotoCamera fontSize="large" />
                      </Avatar>
                    )}
                    <IconButton
                      color="primary"
                      aria-label="upload face image"
                      onClick={() => handleTriggerUpload('faceImage')}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleTriggerUpload('faceImage')}
                  >
                    Chọn ảnh
                  </Button>
                </Box>
              </Box>
              
              {/* Fingerprint Image */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ảnh vân tay
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  p: 2
                }}>
                  <input
                    ref={fingerPrintInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="fingerprint-upload"
                    type="file"
                    onChange={handleFileUpload('fingerPrint')}
                  />
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    {fingerPrintPreview ? (
                      <Avatar 
                        src={fingerPrintPreview} 
                        alt="Ảnh vân tay"
                        sx={{ width: 150, height: 150, mb: 1 }}
                      />
                    ) : (
                      <Avatar 
                        sx={{ width: 150, height: 150, mb: 1, bgcolor: 'grey.300' }}
                      >
                        <FingerprintIcon fontSize="large" />
                      </Avatar>
                    )}
                    <IconButton
                      color="primary"
                      aria-label="upload fingerprint"
                      onClick={() => handleTriggerUpload('fingerPrint')}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleTriggerUpload('fingerPrint')}
                  >
                    Chọn ảnh
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditing ? 'Cập nhật' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm; 