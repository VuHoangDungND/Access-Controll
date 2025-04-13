import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  OutlinedInput,
  Chip,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import { User, Device, HistoryEntry } from '../../types';
import { userService, deviceService, historyService } from '../../services/api';

const History: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, devicesData, historiesData] = await Promise.all([
          userService.getUsers(),
          deviceService.getDevices(),
          historyService.getHistories()
        ]);
        setUsers(usersData);
        setDevices(devicesData);
        setFilteredHistory(historiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilter = async () => {
    const data: HistoryEntry[] = await historyService.getHistorieByListID({
      selectedUsers,
      selectedDevices,
      startTime,
      endTime
    })

    setFilteredHistory(data);
    setPage(0);
  };

  const handleChangeUsers = (event: any) => {
    const { value } = event.target;
    setSelectedUsers(typeof value === 'string' ? value.split(',') : value);
  };

  const handleChangeDevices = (event: any) => {
    const { value } = event.target;
    setSelectedDevices(typeof value === 'string' ? value.split(',') : value);
  };

  const handleStartTimeChange = (newValue: Date | null) => {
    setStartTime(newValue);
  };

  const handleEndTimeChange = (newValue: Date | null) => {
    setEndTime(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : 'Unknown';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Lịch sử vào ra
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
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
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
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
                >
                  {devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <DateTimePicker
                label="Từ ngày"
                value={startTime}
                onChange={handleStartTimeChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="Đến ngày"
                value={endTime}
                onChange={handleEndTimeChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>

            <Button
              variant="contained"
              onClick={handleFilter}
              sx={{ alignSelf: 'flex-start' }}
            >
              Lọc
            </Button>
          </Stack>
        </Paper>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Thiết bị</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
                      <TableCell>{getUserName(entry.userId)}</TableCell>
                      <TableCell>{getDeviceName(entry.deviceId)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default History; 