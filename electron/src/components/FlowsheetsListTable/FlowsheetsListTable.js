import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings'; 

 
export default function FlowsheetsListTable(props) {
  
    return (
        <TableContainer>
            <Table sx={{ minWidth: 700 }} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Last Run</TableCell> 
                <TableCell></TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {props.rows.map((row) => (
                <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell>
                    <a href={"/flowsheet/" + row.id_ + "/config"}>{row.name}</a>
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                    <IconButton color="primary" aria-label="Edit project">
                        <SettingsIcon />
                    </IconButton>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
            </Table>
        </TableContainer>
    );

}
 
