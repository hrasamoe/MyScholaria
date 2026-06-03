import bcrypt from "bcryptjs";
import { pool } from "../../db/pool";
import { sendApprovalEmail } from "../../services/email/aprovalTemplate";
import {
  ClassInfo,
  EstablishmentInput,
  JoinInput,
} from "./establishments.schema";

export async function createEtablishments(data: EstablishmentInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id FROM establishments WHERE code = $1`,
      [data.code],
    );
    if (existing.rows.length > 0)
      throw new Error("Another establishment already exists");

    const hashedJoinCode = await bcrypt.hash(data.joinCode, 12);
    const hashedAdminCode = await bcrypt.hash(data.adminCode, 12);

    const { rows } = await client.query(
      `INSERT INTO establishments (
        name, code, type, address, phone, email, created_at,
        identification_number, join_code, admin_code,
        join_code_hash, admin_code_hash, is_active, owner_id, city, zip_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        data.name,
        data.code,
        data.type,
        data.address,
        data.phone,
        data.email,
        new Date(),
        data.identificationNumber,
        data.joinCode,
        data.adminCode,
        hashedJoinCode,
        hashedAdminCode,
        true,
        data.owner_id,
        data.city,
        data.zipCode,
      ],
    );
    const establishment = rows[0];
    await client.query(
      "UPDATE profiles SET establishment_id = $1 WHERE user_id = $2",
      [establishment.id, data.owner_id],
    );
    await client.query(
      `INSERT INTO school_periods (
        establishment_id, name, start_date, end_date,
        academic_year, is_current, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        establishment.id,
        "2025-2026",
        new Date("2025-09-01"),
        new Date("2026-07-20"),
        "2025-2026",
        true,
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO fee_structures (
        establishment_id, name, academic_year, amount, frequency, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        establishment.id,
        "Droit d'inscription",
        "2025-2026",
        "0",
        "annual",
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO subscriptions (
        establishment_id, plan_type, status, current_period_start,
        current_period_end, cancel_at_period_end, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        establishment.id,
        "free",
        "active",
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        false,
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO settings (establishment_id, key, value, updated_at)
       VALUES ($1,$2,$3,$4)`,
      [
        establishment.id,
        "grading_system",
        JSON.stringify({ system: "out_of_20", pass_mark: 10 }),
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO establishment_members (
        establishment_id, user_id, role_name, joined_at, is_active, is_aproved
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [establishment.id, data.owner_id, "admin", new Date(), true, true],
    );

    const existingRole = await client.query(
      `SELECT id FROM user_roles WHERE user_id = $1 AND role = $2`,
      [data.owner_id, "admin"],
    );
    if (existingRole.rows.length === 0) {
      await client.query(
        `INSERT INTO user_roles (user_id, role, created_at) VALUES ($1,$2,$3)`,
        [data.owner_id, "admin", new Date()],
      );
    }

    await client.query(
      `INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, metadata, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        data.owner_id,
        "CREATE_ESTABLISHMENT",
        "establishment",
        establishment.id,
        JSON.stringify({
          name: establishment.name,
          code: establishment.code,
          type: establishment.type,
        }),
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, link, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        data.owner_id,
        "establishment_created",
        "Your establishment has been created!",
        `${establishment.name} is now ready to use.`,
        `/establishment/${establishment.id}/dashboard`,
        new Date(),
      ],
    );

    await client.query("COMMIT");
    return establishment;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function joinEstablishment(data: JoinInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const exist = await client.query(
      `SELECT user_id FROM establishment_members WHERE user_id = $1 AND establishment_id = $2`,
      [data.userID, data.establishmentID],
    );
    if (exist.rows.length > 0) return;

    await client.query(
      `INSERT INTO establishment_members (
        establishment_id, user_id, role_name, joined_at, is_active, is_aproved
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.establishmentID, data.userID, data.role, new Date(), true, false],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getMyEstablishment(userID: string | undefined) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT * FROM establishment_members
        WHERE user_id = $1`,
      [userID],
    );
    if (rows.length === 0) throw new Error("You are not in such establishment");

    const myEstablishment = rows[0];
    const { rows: myEstablishments } = await client.query(
      `SELECT * FROM establishments WHERE id = $1`,
      [myEstablishment.establishment_id],
    );
    const response = myEstablishments[0];
    return response;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function selectEstablishment(
  userID: string,
  code: string,
  joinCode: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: estRows } = await client.query(
      `SELECT * FROM establishments WHERE code = $1 AND is_active = true`,
      [code],
    );
    if (estRows.length === 0) throw new Error("Establishment not found");

    const establishment = estRows[0];

    const match = await bcrypt.compare(joinCode, establishment.join_code_hash);
    if (!match) throw new Error("Incorrect join code");

    const { rows: memberRows } = await client.query(
      `SELECT em.is_aproved, em.role_name
       FROM establishment_members em
       WHERE em.user_id = $1 AND em.establishment_id = $2 AND em.is_active = true`,
      [userID, establishment.id],
    );

    if (memberRows.length === 0)
      throw new Error("You are not a member of this establishment");

    const member = memberRows[0];

    await client.query("COMMIT");

    return {
      establishment_id: establishment.id,
      establishment_name: establishment.name,
      is_aproved: member.is_aproved,
      role_name: member.role_name,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function findAllMemberAproved(establishmentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: allUsers } = await client.query(
      ` SELECT u.id AS user_id,
    p.full_name AS name,
    u.email,
    m.role_name AS role,
    m.is_active,
    m.is_aproved,
    m.joined_at
    FROM establishment_members m
    INNER JOIN users u ON m.user_id = u.id
    INNER JOIN profiles p ON u.id = p.user_id
    WHERE m.is_aproved = true AND m.establishment_id = $1
  `,
      [establishmentID],
    );
    await client.query("COMMIT");
    return allUsers;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findPendingMember(establishmentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: pendingUsers } = await client.query(
      `SELECT 
        u.id AS user_id,
        COALESCE(p.full_name, CONCAT(p.first_name, ' ', p.last_name)) AS name,
        u.email,
        m.role_name AS role,
        m.is_active,
        m.is_aproved,
        m.joined_at
      FROM establishment_members m
      INNER JOIN users u ON m.user_id = u.id
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE m.is_aproved = false AND m.establishment_id = $1`,
      [establishmentID],
    );
    await client.query("COMMIT");
    return pendingUsers;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function approveMember(
  email: string,
  establishmentId: string,
  isAproved: boolean,
  role: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userRes = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (userRes.rows.length === 0) {
      throw new Error("User not found");
    }

    const userId = userRes.rows[0].id;

    const updateRes = await client.query(
      `UPDATE establishment_members
       SET is_aproved = $1, role_name = $2
       WHERE user_id = $3 AND establishment_id = $4
       RETURNING *`,
      [isAproved, role, userId, establishmentId],
    );

    if (updateRes.rows.length === 0) {
      throw new Error("Membre introuvable dans cet établissement");
    }

    await client.query("COMMIT");
    if (isAproved) {
      const establishmentName = await client.query(
        `SELECT name FROM establishments WHERE id = $1`,
        [establishmentId],
      );
      const userName = await client.query(
        `SELECT full_name FROM profiles WHERE user_id = $1`,
        [userRes.rows[0].id],
      );
      sendApprovalEmail(
        email,
        userName.rows[0].full_name,
        establishmentName.rows[0].name,
      );
    }

    return updateRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de l'approbation du membre :", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function createClasses(
  establishmentID: string,
  classData: ClassInfo,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
      INSERT INTO classes (name, level, academic_year, establishment_id, main_teacher_id, room_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      classData.name,
      classData.level,
      classData.academicYear,
      establishmentID,
      classData.mainTeacherID,
      classData.classRoomID,
      new Date(),
      new Date(),
    ];
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (error: any) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.log(error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function getClassList(establishmentID: string) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT
        c.id,
        c.name,
        c.level,
        c.academic_year,
        c.establishment_id,
        c.main_teacher_id,
        c.room_id,
        c.created_at,
        c.updated_at,

        t.id                                    AS teacher_pid,
        p.id                                    AS teacher_profile_id,
        CONCAT(p.first_name, ' ', p.last_name)  AS teacher_full_name,
        p.gender                                AS teacher_gender,

        cr.name                                 AS classroom_name,
        cr.capacity                             AS classroom_capacity,
        cr.building                             AS classroom_building,
        cr.type                                 AS classroom_type

      FROM classes c
      LEFT JOIN teachers t    ON c.main_teacher_id = t.id
      LEFT JOIN profiles p    ON t.profile_id = p.id
      LEFT JOIN rooms cr ON c.room_id = cr.id

      WHERE c.establishment_id = $1
      ORDER BY c.created_at DESC`,
      [establishmentID],
    );
    return rows;
  } catch (error: any) {
    console.error("Error fetching class list:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function editClass(classID: string, classData: ClassInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    UPDATE classes SET name = $1, level = $2, academic_year = $3, main_teacher_id = $4, room_id = $5, updated_at = $6
    WHERE id = $7
    `;
    const values = [
      classData.name,
      classData.level,
      classData.academicYear,
      classData.mainTeacherID,
      classData.classRoomID,
      new Date(),
      classID,
    ];
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteClass(classID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `DELETE FROM classes WHERE id = $1`;
    await client.query(queryText, [classID]);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
