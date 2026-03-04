import { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth(); 

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    axiosInstance.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return <Badge bg="danger">مدير عام</Badge>;
      case 'admin': return <Badge bg="primary">مدير إداري</Badge>;
      default: return <Badge bg="secondary">محرر</Badge>;
    }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold text-dark d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary fs-2">manage_accounts</span>
          إدارة المدراء والصلاحيات
        </h2>
        {currentUser?.role === 'super_admin' && (
          <Link to="/admin/users/create" className="btn btn-primary fw-bold d-flex align-items-center gap-2 px-4 shadow-sm">
            <span className="material-symbols-outlined">person_add</span> إضافة مستخدم جديد
          </Link>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle text-center">
          <thead className="bg-light">
            <tr>
              <th className="py-3 text-secondary">الاسم</th>
              <th className="py-3 text-secondary">البريد الإلكتروني</th>
              <th className="py-3 text-secondary">الصلاحية</th>
              <th className="py-3 text-secondary">الحالة</th>
              <th className="py-3 text-secondary">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="fw-bold">{user.name}</td>
                <td dir="ltr">{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{user.isActive ? <Badge bg="success" pill>نشط</Badge> : <Badge bg="danger" pill>موقوف</Badge>}</td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    {currentUser?.role === 'super_admin' ? (
                      <>
                        <Link to={`/admin/users/edit/${user.id}`} state={{ userItem: user }} className="btn btn-sm btn-light text-primary border shadow-sm">
                          <span className="material-symbols-outlined fs-6">edit</span>
                        </Link>
                        {currentUser.id !== user.id && (
                          <Button variant="light" size="sm" className="text-danger border shadow-sm" onClick={() => handleDelete(user.id)}>
                            <span className="material-symbols-outlined fs-6">delete</span>
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-muted small">للعرض فقط</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}