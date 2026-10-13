import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const responses = sqliteTable('responses', {
 id: text('id').primaryKey(), createdAt: integer('created_at').notNull(), major: text('major').notNull(), region: text('region'), southArea: text('south_area'), level: text('level').notNull(), interest: text('interest').notNull(), donate: text('donate').notNull(), donateCourses: text('donate_courses').notNull(), need: text('need').notNull(), needLevel: text('need_level'), needCourses: text('need_courses').notNull(), attendance: text('attendance').notNull(), notes: text('notes').notNull()
});
