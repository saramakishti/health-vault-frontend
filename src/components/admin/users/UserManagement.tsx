import React, { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Pagination from "react-bootstrap/Pagination";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { useApi } from "../../../hooks/useApi";
import type { UsersListResponse } from "../../../types/admin";
import { DEFAULT_PAGE_SIZE } from "../../../config/constants";
import UserModal from "./UserModal";
import { Badge } from "react-bootstrap";

const UserManagement: React.FC = () => {
  const { get, del, loading, error } = useApi();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [ordering, setOrdering] = useState<string>("-date_created");
  const [data, setData] = useState<UsersListResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Helpers to normalize backend envelope
  const users = useMemo(() => data?.result ?? (data as any)?.results ?? [], [data]);
  const count = useMemo(
    () => data?.pagination?.count ?? (data as any)?.count ?? users.length ?? 0,
    [data, users.length]
  );
  const numPagesFromApi = data?.pagination?.num_pages ?? null;

  const totalPages = useMemo(() => {
    if (numPagesFromApi) return numPagesFromApi;
    // fallback if API doesn’t send num_pages
    return Math.max(1, Math.ceil((count || 0) / pageSize));
  }, [numPagesFromApi, count, pageSize]);

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<UsersListResponse>("/authentication/users/", {
        params: { page, page_size: pageSize, ordering },
      });
      setData(res);
    } catch (e: any) {
      setFetchError(e?.message || "Failed to load users.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, ordering]);

  const goto = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setFetchError(null);
    try {
      await del(`/authentication/users/${id}/`);
      await load();
    } catch (e: any) {
      setFetchError(e?.message || "Failed to delete user.");
    }
  };


  const pageNums = useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <>
      <Card className="mx-auto shadow-sm">
        <Card.Header className="bg-white">
          <Row className="g-2 align-items-end">
            <Col xs={12} md="auto">
              <h1 className="h5 mb-0">User Management</h1>
              <div className="text-muted small">View and manage all user accounts</div>
            </Col>
            <Col xs={12} md={4} className="ms-md-auto">
              <Form.Label className="small mb-1">Order by</Form.Label>
              <Form.Select
                value={ordering}
                onChange={(e) => {
                  setPage(1);
                  setOrdering(e.target.value);
                }}
              >
                <option value="-date_created">Newest first</option>
                <option value="date_created">Oldest first</option>
                <option value="email">Email A–Z</option>
                <option value="-email">Email Z–A</option>
                <option value="first_name">First name A–Z</option>
                <option value="-first_name">First name Z–A</option>
                <option value="last_name">Last name A–Z</option>
                <option value="-last_name">Last name Z–A</option>
                <option value="role">Role A–Z</option>
                <option value="-role">Role Z–A</option>
              </Form.Select>
            </Col>
            <Col xs="auto">
              <Button variant="primary" className="me-2" onClick={() => setShowCreate(true)}>
                + Create User
              </Button>
              <Button variant="outline-secondary" onClick={() => void load()}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" /> Refresh
                  </>
                ) : (
                  "Refresh"
                )}
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {(error || fetchError) && (
            <div className="p-3">
              <Alert variant="danger" className="mb-0">
                {fetchError || error}
              </Alert>
            </div>
          )}

          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 70 }}>#</th>
                  <th>Email</th>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>Phone</th>
                  <th>Birthday</th>
                  <th>Gender</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && !data ? (
                  <tr>
                    <td colSpan={11} className="text-center py-5">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="text-muted">{u.id}</td>
                      <td className="fw-semibold">{u.email}</td>
                      <td>{u.first_name || "-"}</td>
                      <td>{u.last_name || "-"}</td>
                      <td>{u.phone || "-"}</td>
                      <td>{u.birthday || "-"}</td>
                      <td>{u.gender || "-"}</td>
                      <td>
                        <Badge
                          bg={u.role === "Admin" ? "danger" : u.role === "Doctor" ? "success" : "warning"}
                          pill={false}
                        >{u.role ?? u.group_name ?? "-"}</Badge>
                      </td>
                      <td>{u.date_created ? new Date(u.date_created).toLocaleString() : "-"}</td>
                      <td>
                        {u.date_last_updated
                          ? new Date(u.date_last_updated).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onDelete(u.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center text-muted py-5">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        <Card.Footer className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              {`Showing ${users.length} of ${count} users`}
            </div>
            <Pagination className="mb-0">
              <Pagination.First onClick={() => goto(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => goto(page - 1)} disabled={page === 1} />
              {pageNums.map((n) => (
                <Pagination.Item key={n} active={n === page} onClick={() => goto(n)}>
                  {n}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => goto(page + 1)} disabled={page === totalPages} />
              <Pagination.Last onClick={() => goto(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </div>
        </Card.Footer>
      </Card>

      {/* Create modal */}
      <UserModal
        mode="create"
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={() => {
          setShowCreate(false);
          void load();
        }}
      />

      {/* Edit modal */}
      <UserModal
        mode="edit"
        show={!!editingUser}
        initial={editingUser || undefined}
        onClose={() => setEditingUser(null)}
        onSaved={() => {
          setEditingUser(null);
          void load();
        }}
      />

    </ >
  );
};

export default UserManagement;
