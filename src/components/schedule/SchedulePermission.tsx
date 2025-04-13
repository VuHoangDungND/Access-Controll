import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  OutlinedInput,
  Chip,
  CircularProgress,
  TextField,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import { User, Device, Permission } from '../../types';
import { userService, deviceService, permissionService } from '../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SchedulePermission: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // Default: 1 day later
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, devicesData, permissionsData] = await Promise.all([
          userService.getUsers(),
          deviceService.getDevices(),
          permissionService.getPermissions(),
        ]);
        
        setUsers(usersData);
        setDevices(devicesData);
        setPermissions(permissionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangeUsers = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedUsers(typeof value === 'string' ? value.split(',') : value);
  };

  const handleChangeDevices = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedDevices(typeof value === 'string' ? value.split(',') : value);
  };

  const handleStartTimeChange = (newValue: Date | null) => {
    setStartTime(newValue);
  };

  const handleEndTimeChange = (newValue: Date | null) => {
    setEndTime(newValue);
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedUsers([]);
    setSelectedDevices([]);
    setStartTime(new Date());
    setEndTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
  };

  const handleOpenDeleteConfirm = (permission: Permission) => {
    setCurrentPermission(permission);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setCurrentPermission(null);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0 || selectedDevices.length === 0) {
      alert('Vui lòng chọn ít nhất một người dùng và một thiết bị');
      return;
    }

    if (!startTime || !endTime) {
      alert('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    if (startTime >= endTime) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setSubmitting(true);
    try {
      await permissionService.createPermission(
        selectedUsers, 
        selectedDevices,
        startTime.toISOString(),
        endTime.toISOString()
      );
      
      // Reset selections
      setSelectedUsers([]);
      setSelectedDevices([]);
      // Refresh permissions list
      const updatedPermissions = await permissionService.getPermissions();
      setPermissions(updatedPermissions);
    } catch (error) {
      console.error('Error creating permission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!currentPermission) return;
    
    try {
      await permissionService.deletePermission(currentPermission.id);
      const updatedPermissions = await permissionService.getPermissions();
      setPermissions(updatedPermissions);
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  const getUserNames = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const getDeviceNames = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : 'Unknown';
  };

  // Format date time to display in table
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReload = async () => {
    setLoading(true);
    try {
      const [usersData, devicesData, permissionsData] = await Promise.all([
        userService.getUsers(),
        deviceService.getDevices(),
        permissionService.getPermissions(),
      ]);
      
      setUsers(usersData);
      setDevices(devicesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Gọi API upload file
      await permissionService.uploadPermissions(formData);
      
      // Reset file đã chọn
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload dữ liệu
      await handleReload();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Tạo URL cho file mẫu
    const templateUrl = '/template/Set_Schedule.xlsx';
    
    // Tạo một thẻ a ẩn để tải file
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'Set_Schedule.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Pagination logic
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - permissions.length) : 0;
  const paginatedPermissions = permissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Lập lịch & Phân quyền
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
              onClick={handleReload}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tạo phân quyền mới
          </Typography>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth sx={{ flex: 2 }}>
                <InputLabel id="user-select-label">Người dùng</InputLabel>
                <Select
                  labelId="user-select-label"
                  id="user-select"
                  multiple
                  value={selectedUsers}
                  onChange={handleChangeUsers}
                  input={<OutlinedInput label="Người dùng" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = users.find((user) => user.id === value);
                        return <Chip key={value} label={user?.name || value} />;
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ flex: 2 }}>
                <InputLabel id="device-select-label">Thiết bị</InputLabel>
                <Select
                  labelId="device-select-label"
                  id="device-select"
                  multiple
                  value={selectedDevices}
                  onChange={handleChangeDevices}
                  input={<OutlinedInput label="Thiết bị" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const device = devices.find((device) => device.id === value);
                        return <Chip key={value} label={device?.name || value} />;
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name} ({device.location})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <DateTimePicker
                label="Thời gian bắt đầu"
                value={startTime}
                onChange={handleStartTimeChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="Thời gian kết thúc"
                value={endTime}
                onChange={handleEndTimeChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{ minWidth: 150 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Lưu phân quyền'}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Lịch sử phân quyền
        </Typography>
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="permissions table">
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>Thời gian bắt đầu</TableCell>
                  <TableCell>Thời gian kết thúc</TableCell>
                  <TableCell>Thời gian tạo</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPermissions.map((permission, index) => (
                  <TableRow key={permission.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{getUserNames(permission.userId)}</TableCell>
                    <TableCell>{getDeviceNames(permission.deviceId)}</TableCell>
                    <TableCell>{permission.startTime ? formatDateTime(permission.startTime) : 'N/A'}</TableCell>
                    <TableCell>{permission.endTime ? formatDateTime(permission.endTime) : 'N/A'}</TableCell>
                    <TableCell>{formatDateTime(permission.createdAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteConfirm(permission)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
                {permissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Chưa có dữ liệu phân quyền
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={permissions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa quyền truy cập này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Hủy</Button>
          <Button onClick={handleDeletePermission} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SchedulePermission; 