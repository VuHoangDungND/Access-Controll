import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Fab,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TablePagination,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { Device } from '../../types';
import { deviceService } from '../../services/api';
import DeviceForm from '../../components/device/DeviceForm';

interface DeviceProfile {
  id: string;
  name: string;
}

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceProfiles, setDeviceProfiles] = useState<DeviceProfile[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await deviceService.getDevices(rowsPerPage, page);
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [devicesData, profilesData] = await Promise.all([
          deviceService.getDevices(),
          deviceService.getDeviceProfiles()
        ]);
        setDevices(devicesData);
        setDeviceProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenForm = (edit = false, device: Device | null = null) => {
    setIsEditing(edit);
    setCurrentDevice(device);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentDevice(null);
    setIsEditing(false);
  };

  const handleOpenDeleteConfirm = (device: Device) => {
    setCurrentDevice(device);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setCurrentDevice(null);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFormSubmit = async (deviceData: Omit<Partial<Device>, 'id'>) => {
    try {
      if (isEditing && currentDevice) {
        await deviceService.updateDevice(currentDevice.id, deviceData);
      } else {
        await deviceService.createDevice(deviceData);
      }
      fetchDevices();
      handleCloseForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDeleteDevice = async () => {
    if (!currentDevice) return;
    
    try {
      await deviceService.deleteDevice(currentDevice.id);
      fetchDevices();
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const handleReload = async () => {
    setLoading(true);
    try {
      const data = await deviceService.getDevices();
      setDevices(data);
    } catch (error) {
      console.error('Error reloading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - devices.length) : 0;
  const paginatedDevices = devices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await deviceService.uploadDevices(formData);
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await fetchDevices();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateUrl = '/template/Add_Devices.xlsx';
    
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'Add_Devices.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý thiết bị
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Tải file mẫu
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Chọn file
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedFile.name}
              </Typography>
            )}
            {selectedFile && (
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            )}
          </Box>
          <IconButton 
            color="primary" 
            onClick={fetchDevices}
          >
            <RefreshIcon />
          </IconButton>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => handleOpenForm()}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="devices table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tên thiết bị</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Vị trí</TableCell>
                  <TableCell>Trạng thái hoạt động</TableCell>
                  <TableCell>Trạng thái cửa</TableCell>
                  <TableCell>Camera</TableCell>
                  <TableCell>RFID</TableCell>
                  <TableCell>Vân tay</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.id}</TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>{device.status}</TableCell>
                    <TableCell>{device.doorStatus}</TableCell>
                    <TableCell>{device.camStatus}</TableCell>
                    <TableCell>{device.rfidStatus}</TableCell>
                    <TableCell>{device.fingerPrintStatus}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenForm(true, device)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteConfirm(device)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
                {devices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có dữ liệu thiết bị
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={devices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </Paper>
      )}

      {/* Device Form Dialog */}
      <DeviceForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        device={currentDevice}
        isEditing={isEditing}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thiết bị {currentDevice?.name} không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Hủy</Button>
          <Button onClick={handleDeleteDevice} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeviceList; 