import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Content } from '../content/content.entity';

@Entity()
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  dateCreated: Date;

  @Column({ nullable: true })
  fileName: string;
  
  @Column({ nullable: true })
  imgUrl: string;

  @OneToMany(() => Content, (content) => content.course)
  contents: Content[];
}
