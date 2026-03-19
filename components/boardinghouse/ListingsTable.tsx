import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Chip, Typography, Stack, Box, Avatar, alpha, useTheme,
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import type { BoardingHouseResponse, GenderPreference } from '@/features/boardinghouse/types';

const GENDER_COLORS: Record<GenderPreference, string> = {
    MALE: '#3B82F6',
    FEMALE: '#EC4899',
    ANY: '#10B981',
};

const GENDER_LABELS: Record<GenderPreference, string> = {
    MALE: 'Male Only',
    FEMALE: 'Female Only',
    ANY: 'Any Gender',
};

type Props = {
    listings: BoardingHouseResponse[];
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onView: (listing: BoardingHouseResponse) => void;
    onEdit?: (listing: BoardingHouseResponse) => void;
    onDelete?: (listing: BoardingHouseResponse) => void;
    onManageImages?: (listing: BoardingHouseResponse) => void;
    showActions?: boolean;
};

export default function ListingsTable({
    listings, total, page, pageSize, onPageChange, onPageSizeChange,
    onView, onEdit, onDelete, onManageImages, showActions = false,
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuListing, setMenuListing] = React.useState<BoardingHouseResponse | null>(null);

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, listing: BoardingHouseResponse) => {
        setAnchorEl(e.currentTarget);
        setMenuListing(listing);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuListing(null);
    };

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Listing</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Rooms</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Views</TableCell>
                            {showActions && <TableCell align="right">Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listings.map((listing) => (
                            <TableRow
                                key={listing.id}
                                hover
                                onClick={() => onView(listing)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                            >
                                <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Avatar
                                            variant="rounded"
                                            src={listing.primaryImageUrl || undefined}
                                            sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                        >
                                            {listing.title.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                                                {listing.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                by {listing.postedByName}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{listing.city}</Typography>
                                    <Typography variant="caption" color="text.secondary">{listing.district}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        {listing.formattedPrice || `Rs. ${listing.price.toLocaleString()}`}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={GENDER_LABELS[listing.genderPreference]}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(GENDER_COLORS[listing.genderPreference], 0.1),
                                            color: GENDER_COLORS[listing.genderPreference],
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {listing.availableRooms ?? '-'} / {listing.totalRooms ?? '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={listing.isAvailable ? 'Available' : 'Unavailable'}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(listing.isAvailable ? '#10B981' : '#6B7280', 0.1),
                                            color: listing.isAvailable ? '#10B981' : '#6B7280',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{listing.viewCount}</Typography>
                                </TableCell>
                                {showActions && (
                                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, listing)}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {listings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={showActions ? 8 : 7} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">No listings found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, p) => onPageChange(p)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                rowsPerPageOptions={[5, 10, 25]}
            />

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { if (menuListing) onView(menuListing); handleMenuClose(); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                {onEdit && (
                    <MenuItem onClick={() => { if (menuListing) onEdit(menuListing); handleMenuClose(); }}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                )}
                {onManageImages && (
                    <MenuItem onClick={() => { if (menuListing) onManageImages(menuListing); handleMenuClose(); }}>
                        <ListItemIcon><ImageIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Manage Images</ListItemText>
                    </MenuItem>
                )}
                {onDelete && (
                    <MenuItem onClick={() => { if (menuListing) onDelete(menuListing); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
}
