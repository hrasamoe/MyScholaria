import { pool } from "../../db/pool";
import { TuitionInfo, StudentTuitionInfo } from "./tuition.schema";

export async function createTuition(TuitionData: TuitionInfo, userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `INSERT INTO fee_configurations (
      class_id,
      tuition_fee,
      registration_fee,
      academic_year,
      establishment_id,
      created_by,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const now = new Date().toISOString();
    const values = [
      TuitionData.classID,
      TuitionData.tuitionFee,
      TuitionData.registrationFee,
      TuitionData.academicYear,
      TuitionData.establishmentID,
      userID,
      now,
      now,
    ];

    const result = await client.query(insertQuery, values);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getTuitionList(establishentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT
          fc.id,
          fc.class_id,
          r.name AS room_name,
          c.name AS class_name,
          fc.tuition_fee::float,
          fc.registration_fee::float,
          CONCAT_WS(' ', p.first_name, p.last_name) AS teacher_full_name,
          fc.academic_year
      FROM fee_configurations fc
      JOIN classes c ON fc.class_id = c.id
      JOIN teachers t ON c.main_teacher_id = t.id
      JOIN profiles p ON t.profile_id = p.id
      JOIN rooms r ON c.room_id = r.id
      WHERE fc.establishment_id = $1
      `,
      [establishentID],
    );
    await client.query("COMMIT");
    return result.rows;
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function editTuition(
  TuitionID: string,
  TuitionData: TuitionInfo,
  userID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const rowsToUpdate = await client.query(
      "SELECT * FROM fee_configurations WHERE id = $1",
      [TuitionID],
    );
    if (rowsToUpdate.rowCount === 0) {
      throw new Error("Tuition not found");
    }
    if (rowsToUpdate.rows[0].created_by !== userID) {
      throw new Error("You are not allowed to modify this Tuition");
    }
    const updateQuery = `UPDATE fee_configurations SET
        tuition_fee = $1, 
        registration_fee = $2,
        academic_year = $3,
        updated_at = $4
      WHERE id = $5 RETURNING *`;
    const now = new Date().toISOString();
    const values = [
      TuitionData.tuitionFee,
      TuitionData.registrationFee,
      TuitionData.academicYear,
      now,
      TuitionID,
    ];
    const result = await client.query(updateQuery, values);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteTuition(TuitionID: string, userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const rowsToDelete = await client.query(
      "SELECT * FROM fee_configurations WHERE id = $1",
      [TuitionID],
    );
    if (rowsToDelete.rows[0].created_by !== userID) {
      throw new Error("You are not allowed to delete this tuition data");
    }
    await client.query("DELETE from fee_configurations WHERE id = $1", [
      TuitionID,
    ]);
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function saveStudentTuition(
  studentId: string,
  StudentTuitionData: StudentTuitionInfo,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const upsertSettingsQuery = `
            INSERT INTO student_finance_settings (
                student_id, base_monthly_tuition, discount_type, discount_value, 
                total_paid_amount, registration_fee, is_registration_fee_paid, notes, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (student_id) 
            DO UPDATE SET 
                base_monthly_tuition = EXCLUDED.base_monthly_tuition,
                discount_type = EXCLUDED.discount_type,
                discount_value = EXCLUDED.discount_value,
                total_paid_amount = EXCLUDED.total_paid_amount,
                registration_fee = EXCLUDED.registration_fee,
                is_registration_fee_paid = EXCLUDED.is_registration_fee_paid,
                notes = EXCLUDED.notes,
                updated_at = NOW();
        `;
    await client.query(upsertSettingsQuery, [
      studentId,
      StudentTuitionData.base_monthly_tuition,
      StudentTuitionData.discount_type,
      StudentTuitionData.discount_value,
      StudentTuitionData.total_paid_amount,
      StudentTuitionData.registration_fee,
      StudentTuitionData.is_registration_fee_paid,
      StudentTuitionData.notes,
    ]);
    for (const m of StudentTuitionData.tuition_months) {
      const upsertMonthQuery = `
        INSERT INTO student_tuition_months (student_id, month_id, month_name, amount_due, is_paid)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (student_id, month_id)
        DO UPDATE SET
            amount_due = EXCLUDED.amount_due,
            is_paid = EXCLUDED.is_paid;
        `;
      await client.query(upsertMonthQuery, [
        studentId,
        m.id,
        m.month,
        m.amount_due,
        m.is_paid,
      ]);
    }
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  }
}

const countAcademicMonths = (startMonth: number, endMonth: number): number => {
  if (endMonth >= startMonth) {
    return endMonth - startMonth + 1;
  }
  return 12 - startMonth + 1 + endMonth;
};

export const getFinanceOverview = async (establishmentID: string) => {
  const establishmentRes = await pool.query(
    `SELECT academic_year_start_month, academic_year_end_month
     FROM establishments
     WHERE id = $1`,
    [establishmentID],
  );

  if (establishmentRes.rows.length === 0) {
    throw new Error("Establishment not found");
  }

  const { academic_year_start_month, academic_year_end_month } =
    establishmentRes.rows[0];
  const fallbackMonthsCount = countAcademicMonths(
    Number(academic_year_start_month),
    Number(academic_year_end_month),
  );

  // Current academic year label, used to prefer the matching
  // fee_configurations row when a class has several (one per year).
  const currentPeriodRes = await pool.query(
    `SELECT academic_year
     FROM school_periods
     WHERE establishment_id = $1 AND is_current = true
     LIMIT 1`,
    [establishmentID],
  );
  const currentAcademicYear = currentPeriodRes.rows[0]?.academic_year ?? null;

  const query = `
    SELECT
      s.id,
      p.first_name,
      p.last_name,
      s.student_number,
      c.name AS class_name,
      fs.base_monthly_tuition,
      fs.discount_type,
      fs.discount_value,
      fs.total_paid_amount,
      fs.registration_fee AS student_registration_fee,
      fs.is_registration_fee_paid,
      fc.tuition_fee AS class_tuition_fee,
      fc.registration_fee AS class_registration_fee,
      COUNT(tm.id) AS recorded_months_count,
      COUNT(tm.id) FILTER (WHERE tm.is_paid = false) AS unpaid_months_count
    FROM students s
    JOIN profiles p ON p.id = s.profile_id
    LEFT JOIN classes c ON c.id = s.class_id
    LEFT JOIN student_finance_settings fs ON fs.student_id = s.id
    LEFT JOIN student_tuition_months tm ON tm.student_id = s.id
    -- Picks the fee_configurations row for this class matching the
    -- current academic year if one exists, otherwise falls back to
    -- the most recently created row for that class.
    LEFT JOIN LATERAL (
      SELECT tuition_fee, registration_fee
      FROM fee_configurations fc
      WHERE fc.class_id = s.class_id
        AND fc.establishment_id = s.establishment_id
      ORDER BY (fc.academic_year = $2) DESC, fc.created_at DESC
      LIMIT 1
    ) fc ON true
    WHERE s.establishment_id = $1
    GROUP BY s.id, p.first_name, p.last_name, s.student_number, c.name,
             fs.base_monthly_tuition, fs.discount_type, fs.discount_value,
             fs.total_paid_amount, fs.registration_fee, fs.is_registration_fee_paid,
             fc.tuition_fee, fc.registration_fee
    ORDER BY p.first_name ASC;
  `;

  const result = await pool.query(query, [
    establishmentID,
    currentAcademicYear,
  ]);

  let totalExpected = 0;
  let totalCollected = 0;
  let unpaidCount = 0;

  const rows = result.rows.map((row: any) => {
    const hasIndividualSettings = row.base_monthly_tuition !== null;

    let finalMonthly = 0;
    if (hasIndividualSettings) {
      const base = Number(row.base_monthly_tuition) || 0;
      if (row.discount_type === "percentage") {
        finalMonthly = base - base * ((Number(row.discount_value) || 0) / 100);
      } else if (row.discount_type === "fixed") {
        finalMonthly = Math.max(0, base - (Number(row.discount_value) || 0));
      } else {
        finalMonthly = base;
      }
    } else {
      finalMonthly = Number(row.class_tuition_fee) || 0;
    }

    const registrationFee =
      row.student_registration_fee !== null
        ? Number(row.student_registration_fee) || 0
        : Number(row.class_registration_fee) || 0;

    const isRegistrationFeePaid = row.is_registration_fee_paid === true;

    const recordedMonths = Number(row.recorded_months_count) || 0;
    const monthsCount =
      recordedMonths > 0 ? recordedMonths : fallbackMonthsCount;

    const tuitionDue = finalMonthly * monthsCount;
    const totalDue = registrationFee + tuitionDue;

    const tuitionPaid = Number(row.total_paid_amount) || 0;
    const totalPaid =
      tuitionPaid + (isRegistrationFeePaid ? registrationFee : 0);

    const balance = Math.max(0, totalDue - totalPaid);
    const hasOverdue = balance > 0 && Number(row.unpaid_months_count) > 0;

    totalExpected += totalDue;
    totalCollected += totalPaid;
    if (balance > 0) unpaidCount += 1;

    return {
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      class_name: row.class_name,
      student_number: row.student_number,
      totalDue,
      totalPaid,
      balance,
      hasOverdue,
      hasSetup: hasIndividualSettings,
    };
  });

  return {
    totals: {
      expected: totalExpected,
      collected: totalCollected,
      remaining: totalExpected - totalCollected,
      unpaidCount,
    },
    students: rows,
  };
};
