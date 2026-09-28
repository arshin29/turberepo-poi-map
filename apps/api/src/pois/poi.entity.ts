import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Poi } from '@poi/shared';

/**
 * TypeORM Entity representing a Point of Interest (POI) in SQLite.
 *
 * @Entity: Tells TypeORM to create and map this class to the 'pois' table.
 * @PrimaryGeneratedColumn('uuid'): Generates a unique UUID primary key automatically.
 * @Column: Maps class properties to table columns.
 * @CreateDateColumn / @UpdateDateColumn: Automatically managed timestamps.
 */
@Entity('pois')
export class PoiEntity implements Poi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
