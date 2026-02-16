import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole, UserStatus } from './modules/users/entities/user.entity';
import { DoctorsService } from './modules/doctors/doctors.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const doctorsService = app.get(DoctorsService);

    const email = 'cornalinabeng@mydermalife.com';
    const password = 'password123';
    const firstName = 'Cornaline';
    const lastName = 'Abeng';

    console.log(`Checking for user ${email}...`);
    let user = await usersService.findByEmail(email);

    if (!user) {
        console.log(`User ${email} not found. Creating...`);
        // Note: ensure your usersService.create method accepts firstName/lastName and creates the profile
        user = await usersService.create({
            email,
            password,
            firstName,
            lastName,
            role: UserRole.DOCTOR,
        });
        console.log(`User created with ID: ${user.id}`);
    } else {
        console.log(`User ${email} already exists.`);
    }

    // Ensure user is active and has Doctor role
    let changed = false;
    if (user.status !== UserStatus.ACTIVE) {
        user.status = UserStatus.ACTIVE;
        changed = true;
        console.log('User activating...');
    }

    if (user.role !== UserRole.DOCTOR) {
        user.role = UserRole.DOCTOR;
        changed = true;
        console.log('User role updating to DOCTOR...');
    }

    if (changed) {
        await user.save();
    }

    // Ensure Doctor profile exists
    try {
        const doctor = await doctorsService.findByUserId(user.id);
        console.log('Doctor profile already exists.');
    } catch (error) {
        console.log('Doctor profile not found. Creating...');
        await doctorsService.create({
            userId: user.id,
            licenseNumber: 'DOC-' + Math.floor(Math.random() * 10000),
            specialization: 'Dermatologist',
            yearsOfExperience: 8,
            bio: 'Dr. Cornaline Abeng is an experienced dermatologist specializing in skincare treatments.',
            education: [],
            certifications: [],
            languagesSpoken: ['en', 'fr'],
        });
        console.log('Doctor profile created.');
    }

    await app.close();
}

bootstrap();
